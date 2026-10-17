import { DurableObject } from "cloudflare:workers";
import {
  MAX_MESSAGE_BYTES,
  PING_MESSAGE,
  PONG_MESSAGE,
  ROOM_PUBLISH_PARAM,
  ROOM_VIEW_PARAM,
  isRoomSecret,
  isViewId,
  parsePublisherMessage,
  viewIdFor,
  type RoomRoll,
  type ViewerMessage,
} from "../../../src/lib/rooms/protocol";
import { isOriginAllowed } from "./origins";
import { ROLL_BURST, takeRollToken, type RollAllowance } from "./rateLimit";

type Role = "publisher" | "viewer";

/** Header the entry Worker uses to tell the room who is connecting. */
const ROLE_HEADER = "X-Room-Role";

/** One overlay plus a handful of screens; more than this is abuse. */
const MAX_SOCKETS_PER_ROOM = 16;
/** A room nobody has used for this long forgets its last roll. */
const IDLE_CLEANUP_MS = 7 * 24 * 60 * 60 * 1000;

const ROLL_KEY = "roll";

interface Attachment extends RollAllowance {
  role: Role;
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
    if (url.pathname !== "/v1/ws") return text("Not found.", 404);
    if (request.method !== "GET") return text("Method not allowed.", 405);
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return text("Expected a WebSocket upgrade.", 426);
    }
    if (!isOriginAllowed(request.headers.get("Origin"), env.ALLOWED_ORIGINS)) {
      return text("Origin not allowed.", 403);
    }

    // Exactly one of the two: the publish secret (overlay) or the view id
    // (companion). The overlay's room is named by the hash of its secret, so
    // both land in the same room without the view id revealing the secret.
    const secret = url.searchParams.get(ROOM_PUBLISH_PARAM);
    const view = url.searchParams.get(ROOM_VIEW_PARAM);
    let roomName: string;
    let role: Role;
    if (secret !== null && view === null && isRoomSecret(secret)) {
      roomName = await viewIdFor(secret);
      role = "publisher";
    } else if (view !== null && secret === null && isViewId(view)) {
      roomName = view;
      role = "viewer";
    } else {
      return text("Invalid room.", 400);
    }

    const stub = env.ROOMS.get(env.ROOMS.idFromName(roomName));
    const headers = new Headers(request.headers);
    headers.set(ROLE_HEADER, role);
    return stub.fetch(new Request(request.url, { headers }));
  },
} satisfies ExportedHandler<Env>;

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
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair(PING_MESSAGE, PONG_MESSAGE),
    );
  }

  async fetch(request: Request): Promise<Response> {
    const role = request.headers.get(ROLE_HEADER);
    if (role !== "publisher" && role !== "viewer") {
      return text("Invalid role.", 400);
    }
    if (this.ctx.getWebSockets().length >= MAX_SOCKETS_PER_ROOM) {
      return text("Room is full.", 429);
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    this.ctx.acceptWebSocket(server, [role]);
    const attachment: Attachment = {
      role,
      tokens: ROLL_BURST,
      refilledAt: Date.now(),
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
      this.broadcastPresence();
    }
    await this.scheduleCleanup();

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    const attachment = ws.deserializeAttachment() as Attachment | null;
    // Companions only listen; anything they send besides pings is ignored.
    if (attachment?.role !== "publisher") return;

    if (typeof message !== "string") {
      ws.close(1003, "Text messages only.");
      return;
    }
    if (message.length > MAX_MESSAGE_BYTES) {
      ws.close(1009, "Message too large.");
      return;
    }
    const parsed = parsePublisherMessage(message);
    if (!parsed) return;

    const now = Date.now();
    const { allowed, next } = takeRollToken(attachment, now);
    if (!allowed) {
      ws.close(1008, "Too many rolls.");
      return;
    }
    ws.serializeAttachment({ ...attachment, ...next });

    const roll: RoomRoll = { ...parsed.roll, rolledAt: now };
    await this.ctx.storage.put(ROLL_KEY, roll);
    for (const viewer of this.viewers()) {
      this.send(viewer, { type: "roll", roll });
    }
    await this.scheduleCleanup();
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string) {
    this.closeQuietly(ws, code, reason);
    this.onSocketGone(ws);
  }

  async webSocketError(ws: WebSocket) {
    this.closeQuietly(ws, 1011, "Socket error.");
    this.onSocketGone(ws);
  }

  async alarm() {
    if (this.ctx.getWebSockets().length > 0) {
      await this.scheduleCleanup();
      return;
    }
    await this.ctx.storage.deleteAll();
  }

  private onSocketGone(ws: WebSocket) {
    const attachment = ws.deserializeAttachment() as Attachment | null;
    if (attachment?.role === "publisher") this.broadcastPresence(ws);
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

  private async scheduleCleanup() {
    await this.ctx.storage.setAlarm(Date.now() + IDLE_CLEANUP_MS);
  }
}
