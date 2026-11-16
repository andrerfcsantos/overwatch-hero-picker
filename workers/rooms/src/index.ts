import { DurableObject } from "cloudflare:workers";
import {
  MAX_MESSAGE_BYTES,
  PING_MESSAGE,
  PONG_MESSAGE,
  REPLACED_CLOSE_CODE,
  REROLL_MESSAGE,
  ROLL_REQUEST_PATH,
  ROOM_CONTROL_PARAM,
  ROOM_PUBLISH_PARAM,
  ROOM_VIEW_PARAM,
  isControlKey,
  isRerollMessage,
  isViewId,
  parsePublisherMessage,
  type RoomRoll,
  type ViewerMessage,
} from "../../../src/lib/rooms/protocol";
import {
  companionControl,
  readHandshake,
  rerollOutcome,
  type RerollOutcome,
  type Role,
} from "./access";
import { isOriginAllowed } from "./origins";
import {
  ROLL_BURST,
  admitSocket,
  takeRollToken,
  type RollAllowance,
} from "./rateLimit";

/** Header the entry Worker uses to tell the room who is connecting. */
const ROLE_HEADER = "X-Room-Role";
/** Role of a plain HTTP roll request, which opens no socket. */
const ROLL_REQUEST_ROLE = "roll";
/**
 * Header carrying a control key into the room: the room's own, worked out
 * from the secret when the overlay connects, or the one a companion or a
 * roll request claims to hold.
 */
const CONTROL_HEADER = "X-Room-Control";

/** A room nobody has used for this long forgets its last roll. */
const IDLE_CLEANUP_MS = 7 * 24 * 60 * 60 * 1000;

const ROLL_KEY = "roll";
/** The room's control key, learned from its overlay. */
const CONTROL_KEY = "control";

/** URL of the request the entry Worker forwards to a room. Never public. */
const ROOM_URL = "https://room.internal/connect";

interface Attachment extends RollAllowance {
  role: Role;
  /**
   * The control key a companion connected with, or null. One the room knew
   * to be wrong is already dropped; one it could not check yet (no overlay
   * has told it its key) is checked again on each roll request.
   */
  control: string | null;
  connectedAt: number;
  /** Client IP, for the per-address roll limit shared by all rooms. */
  ip: string;
}

function text(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return text("Overwatch Hero Picker rooms relay.", 200);
    }
    if (url.pathname === ROLL_REQUEST_PATH) {
      return requestRoll(request, env, url);
    }
    if (url.pathname !== "/v1/ws") return text("Not found.", 404);
    if (request.method !== "GET") return text("Method not allowed.", 405);
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return text("Expected a WebSocket upgrade.", 426);
    }
    if (!isOriginAllowed(request.headers.get("Origin"), env.ALLOWED_ORIGINS)) {
      return text("Origin not allowed.", 403);
    }
    // Every handshake is a billed request and can create a room, so a client
    // stuck in a connect loop (or a script) is cut off per IP.
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const { success } = await env.HANDSHAKES.limit({ key: ip });
    if (!success) return text("Too many connections.", 429);

    const handshake = await readHandshake({
      secret: url.searchParams.get(ROOM_PUBLISH_PARAM),
      view: url.searchParams.get(ROOM_VIEW_PARAM),
      control: url.searchParams.get(ROOM_CONTROL_PARAM),
    });
    if (!handshake) return text("Invalid room.", 400);
    const { roomName, role, control } = handshake;

    // The room only needs the handshake headers and the role. Its request URL
    // is a fixed internal one, so the publish secret in the public URL goes
    // no further than this Worker (whose invocation logs are off, see
    // wrangler.jsonc).
    const stub = env.ROOMS.get(env.ROOMS.idFromName(roomName));
    const headers = new Headers(request.headers);
    headers.set(ROLE_HEADER, role);
    // Never trust a control header from outside; only what was read above.
    headers.delete(CONTROL_HEADER);
    if (control) headers.set(CONTROL_HEADER, control);
    return stub.fetch(new Request(ROOM_URL, { headers }));
  },
} satisfies ExportedHandler<Env>;

/**
 * Asks a room's overlay for a new hero over plain HTTP, so a Stream Deck
 * button or a macro can roll without a page open. The link's control key is
 * the whole of its authority, so there is no Origin to check: tools that
 * request a URL do not send one.
 */
async function requestRoll(
  request: Request,
  env: Env,
  url: URL,
): Promise<Response> {
  // GET because that is what "open this URL" buttons send.
  if (request.method !== "GET" && request.method !== "POST") {
    return text("Method not allowed.", 405);
  }
  // Its own budget, so a busy Stream Deck cannot use up the handshakes the
  // overlay and companion on the same address need to reconnect.
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const { success } = await env.ROLL_REQUESTS.limit({ key: ip });
  if (!success) return text("Too many requests.", 429);

  const view = url.searchParams.get(ROOM_VIEW_PARAM);
  const control = url.searchParams.get(ROOM_CONTROL_PARAM);
  if (!isViewId(view) || !isControlKey(control)) {
    return text("Invalid roll link.", 400);
  }

  const stub = env.ROOMS.get(env.ROOMS.idFromName(view));
  return stub.fetch(
    new Request(ROOM_URL, {
      headers: {
        [ROLE_HEADER]: ROLL_REQUEST_ROLE,
        [CONTROL_HEADER]: control,
      },
    }),
  );
}

const REROLL_RESPONSES: Record<RerollOutcome, [body: string, status: number]> =
  {
    sent: ["Rolling a new hero.", 200],
    denied: ["Invalid roll link.", 403],
    offline: ["The overlay is not open in OBS.", 409],
    busy: ["Too many rolls. Try again in a moment.", 429],
  };

/**
 * One room per overlay. Holds the overlay's socket and any companion sockets,
 * remembers the last roll so a companion that connects later sees it at once,
 * and tells companions whether the overlay is currently live (with OBS's
 * "Shutdown source when not visible", the overlay page — and its socket —
 * only exists while the source is shown).
 *
 * Uses the WebSocket Hibernation API, so idle rooms are not billed for
 * duration; pings are answered by the runtime without waking the room.
 */
export class Room extends DurableObject<Env> {
  /**
   * When a roll request was last passed on. In memory only: a room that
   * hibernated has been quiet for far longer than the gap this enforces.
   */
  private lastRerollAt = 0;
  /**
   * The room's control key once read from storage, so roll requests do not
   * each cost a read. Undefined until read; lost on hibernation and read
   * again on the next request that needs it.
   */
  private controlKey: string | null | undefined = undefined;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair(PING_MESSAGE, PONG_MESSAGE),
    );
  }

  async fetch(request: Request): Promise<Response> {
    const role = request.headers.get(ROLE_HEADER);
    const control = request.headers.get(CONTROL_HEADER);
    if (role === ROLL_REQUEST_ROLE) {
      const outcome = await this.reroll(control, Date.now());
      return text(...REROLL_RESPONSES[outcome]);
    }
    if (role !== "publisher" && role !== "viewer") {
      return text("Invalid role.", 400);
    }
    const admission = admitSocket(role, {
      publishers: this.publishers().length,
      viewers: this.viewers().length,
    });
    if (admission === "reject") return text("Room is full.", 429);
    if (admission === "replace-oldest-publisher") {
      const oldest = this.publishers().sort(
        (a, b) => connectedAt(a) - connectedAt(b),
      )[0];
      this.closeQuietly(
        oldest,
        REPLACED_CLOSE_CODE,
        "Replaced by a newer overlay.",
      );
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    this.ctx.acceptWebSocket(server, [role]);
    const now = Date.now();
    const attachment: Attachment = {
      role,
      control:
        role === "viewer"
          ? companionControl(control, await this.storedControlKey())
          : null,
      tokens: ROLL_BURST,
      refilledAt: now,
      connectedAt: now,
      ip: request.headers.get("CF-Connecting-IP") ?? "unknown",
    };
    server.serializeAttachment(attachment);

    if (role === "viewer") {
      const roll = (await this.ctx.storage.get<RoomRoll>(ROLL_KEY)) ?? null;
      this.send(server, {
        type: "state",
        roll,
        overlayOnline: this.publishers().length > 0,
      });
    } else {
      // The overlay is the only one that knows the secret, so its connection
      // is what teaches the room its control key.
      if (control && (await this.storedControlKey()) !== control) {
        await this.ctx.storage.put(CONTROL_KEY, control);
        this.controlKey = control;
      }
      this.broadcastPresence();
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    const attachment = ws.deserializeAttachment() as Attachment | null;
    // Companions without a control key only listen. Their pings are answered
    // by the runtime without reaching this handler, so anything that does
    // arrive is a misbehaving client waking the room for nothing.
    if (
      !attachment ||
      (attachment.role !== "publisher" && !attachment.control)
    ) {
      ws.close(1008, "Companions cannot send messages.");
      return;
    }

    // Every message spends a token, valid or not, so neither rolls nor junk
    // can keep the room awake.
    const now = Date.now();
    const { allowed, next } = takeRollToken(attachment, now);
    if (!allowed) {
      ws.close(1008, "Too many messages.");
      return;
    }
    ws.serializeAttachment({ ...attachment, ...next });

    if (attachment.role === "viewer") {
      // Counted per address across rooms before anything else, as overlay
      // messages are below: a script holding many sockets with made-up keys
      // cannot keep rooms awake. A budget of its own, because the roll this
      // leads to is counted against the overlay's address when it is posted.
      const { success } = await this.env.ROLL_REQUESTS.limit({
        key: attachment.ip,
      });
      if (!success) {
        ws.close(1008, "Too many messages from this address.");
        return;
      }
      // A roll request is the only thing a companion can say.
      if (typeof message !== "string" || !isRerollMessage(message)) {
        ws.close(1008, "Invalid message.");
        return;
      }
      const outcome = await this.reroll(attachment.control, now);
      if (outcome === "denied") ws.close(1008, "Invalid control key.");
      return;
    }

    // Every overlay message wakes a room and may cost a storage write, and the
    // account's daily allowances are shared by every room. The per-socket
    // bucket allows bursts; this caps one address across all its sockets and
    // rooms — before any parsing or deduplication, so re-sent or junk
    // messages count too.
    const { success } = await this.env.ROLLS.limit({ key: attachment.ip });
    if (!success) {
      ws.close(1008, "Too many messages from this address.");
      return;
    }

    if (typeof message !== "string") {
      ws.close(1003, "Text messages only.");
      return;
    }
    if (message.length > MAX_MESSAGE_BYTES) {
      ws.close(1009, "Message too large.");
      return;
    }
    const parsed = parsePublisherMessage(message);
    if (!parsed) {
      ws.close(1008, "Invalid message.");
      return;
    }

    // The overlay re-sends its current roll on every reconnect. The same id
    // means the same roll: keep its original time and do not replay it.
    const stored = await this.ctx.storage.get<RoomRoll>(ROLL_KEY);
    if (stored?.id === parsed.roll.id) return;

    const roll: RoomRoll = { ...parsed.roll, rolledAt: now };
    await this.ctx.storage.put(ROLL_KEY, roll);
    for (const viewer of this.viewers()) {
      this.send(viewer, { type: "roll", roll });
    }
    // A backstop in case close events never arrive (the runtime restarting);
    // normally the idle clock starts when the last socket leaves.
    if ((await this.ctx.storage.getAlarm()) === null) {
      await this.ctx.storage.setAlarm(now + IDLE_CLEANUP_MS);
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string) {
    this.closeQuietly(ws, code, reason);
    await this.onSocketGone(ws);
  }

  async webSocketError(ws: WebSocket) {
    this.closeQuietly(ws, 1011, "Socket error.");
    await this.onSocketGone(ws);
  }

  /** Forgets the room once it has been idle for IDLE_CLEANUP_MS. */
  async alarm() {
    // Someone came back; the last of them to leave restarts the idle clock.
    if (this.openSockets().length > 0) return;
    await this.ctx.storage.deleteAll();
    this.controlKey = null;
  }

  /**
   * Passes a request for a new hero on to the overlay, if the key is the
   * room's and the overlay is there to hear it.
   */
  private async reroll(
    claimed: string | null,
    now: number,
  ): Promise<RerollOutcome> {
    // A request without a key is refused before it costs a read.
    const expected = claimed ? await this.storedControlKey() : null;
    const publishers = this.publishers();
    const outcome = rerollOutcome({
      claimed,
      expected,
      publishers: publishers.length,
      lastRerollAt: this.lastRerollAt,
      now,
    });
    if (outcome !== "sent") return outcome;
    this.lastRerollAt = now;
    for (const publisher of publishers) {
      try {
        publisher.send(REROLL_MESSAGE);
      } catch {
        // Closed since the check; its close handler takes care of the rest.
      }
    }
    return "sent";
  }

  private async storedControlKey(): Promise<string | null> {
    if (this.controlKey === undefined) {
      this.controlKey =
        (await this.ctx.storage.get<string>(CONTROL_KEY)) ?? null;
    }
    return this.controlKey;
  }

  private async onSocketGone(ws: WebSocket) {
    const attachment = ws.deserializeAttachment() as Attachment | null;
    if (attachment?.role === "publisher") this.broadcastPresence(ws);
    // The room is idle from the moment its last socket leaves.
    if (this.openSockets(ws).length === 0) {
      await this.ctx.storage.setAlarm(Date.now() + IDLE_CLEANUP_MS);
    }
  }

  private openSockets(except?: WebSocket): WebSocket[] {
    return this.ctx
      .getWebSockets()
      .filter(
        (socket) => socket !== except && socket.readyState === WebSocket.OPEN,
      );
  }

  /** Open sockets with the given role, optionally leaving one out. */
  private sockets(role: Role, except?: WebSocket): WebSocket[] {
    return this.ctx
      .getWebSockets(role)
      .filter(
        (socket) => socket !== except && socket.readyState === WebSocket.OPEN,
      );
  }

  private publishers(except?: WebSocket): WebSocket[] {
    return this.sockets("publisher", except);
  }

  private viewers(): WebSocket[] {
    return this.sockets("viewer");
  }

  private broadcastPresence(closing?: WebSocket) {
    const overlayOnline = this.publishers(closing).length > 0;
    for (const viewer of this.viewers()) {
      this.send(viewer, { type: "presence", overlayOnline });
    }
  }

  private send(ws: WebSocket, message: ViewerMessage) {
    try {
      ws.send(JSON.stringify(message));
    } catch {
      // The socket closed between the check and the send; its close handler
      // takes care of the rest.
    }
  }

  private closeQuietly(ws: WebSocket, code: number, reason: string) {
    try {
      // 1005/1006 are reserved and cannot be sent in a close frame.
      ws.close(code === 1005 || code === 1006 ? 1000 : code, reason);
    } catch {
      // Already closed.
    }
  }
}

function connectedAt(ws: WebSocket): number {
  const attachment = ws.deserializeAttachment() as Attachment | null;
  return attachment?.connectedAt ?? 0;
}
