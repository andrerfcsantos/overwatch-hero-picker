import {
  PING_MESSAGE,
  PONG_MESSAGE,
  REPLACED_CLOSE_CODE,
  ROOM_PUBLISH_PARAM,
  ROOM_VIEW_PARAM,
} from "./protocol";

/**
 * Where the rooms Worker (workers/rooms) listens. Overridable for local
 * development, e.g. NEXT_PUBLIC_ROOMS_URL=ws://127.0.0.1:8787 with
 * `npm run rooms:dev`.
 */
export const ROOMS_URL =
  process.env.NEXT_PUBLIC_ROOMS_URL || "wss://rooms.owheropicker.com";

/**
 * "replaced" is final: a newer overlay took this one's place in the room, so
 * this socket stays closed.
 */
export type RoomConnectionStatus =
  | "connecting"
  | "open"
  | "reconnecting"
  | "replaced";

export type RoomTarget =
  | { role: "publisher"; secret: string }
  | { role: "viewer"; viewId: string };

export interface RoomSocketOptions {
  target: RoomTarget;
  onMessage?: (data: string) => void;
  onStatus?: (status: RoomConnectionStatus) => void;
  /** Called on every successful (re)connect, before onStatus("open"). */
  onOpen?: (send: (data: string) => boolean) => void;
  /** For tests: how to open the socket. */
  createSocket?: (url: string) => WebSocket;
}

export interface RoomSocket {
  /** Sends if connected; returns false (and drops the message) otherwise. */
  send(data: string): boolean;
  close(): void;
}

const PING_INTERVAL_MS = 25_000;
/**
 * A socket can stay "open" on a connection that silently stopped carrying
 * traffic (a phone switching networks, a sleeping laptop). If nothing — not
 * even the pong — arrives this long after a ping, the socket is replaced.
 */
const PONG_TIMEOUT_MS = 10_000;
const MIN_RETRY_MS = 1_000;
/**
 * A connection only counts as healthy, resetting the backoff, after staying
 * open this long. A room that accepts the socket and closes it straight away
 * (a rate limit, say) would otherwise be retried every second forever.
 */
const STABLE_AFTER_MS = 10_000;
/** WebSocket.OPEN, spelled out so tests need no WebSocket global. */
const OPEN = 1;
const MAX_RETRY_MS = 30_000;

export function roomSocketUrl(target: RoomTarget, base = ROOMS_URL): string {
  const url = new URL("/v1/ws", base);
  if (target.role === "publisher") {
    url.searchParams.set(ROOM_PUBLISH_PARAM, target.secret);
  } else {
    url.searchParams.set(ROOM_VIEW_PARAM, target.viewId);
  }
  return url.toString();
}

/**
 * Backoff before the given reconnect attempt (1-based): doubles from 1s up to
 * 30s, with jitter so many clients do not reconnect in lockstep after an
 * outage.
 */
export function retryDelay(attempt: number, random = Math.random): number {
  const base = Math.min(MAX_RETRY_MS, MIN_RETRY_MS * 2 ** (attempt - 1));
  return Math.round(base * (0.75 + random() * 0.5));
}

/**
 * A WebSocket to a room that keeps itself alive: pings while open and
 * reconnects with backoff when dropped, until `close()` is called. Failures
 * never throw into the page — the overlay must keep working without the
 * relay.
 */
export function openRoomSocket(options: RoomSocketOptions): RoomSocket {
  const url = roomSocketUrl(options.target);
  const createSocket =
    options.createSocket ?? ((target) => new WebSocket(target));
  let socket: WebSocket | null = null;
  let closed = false;
  let attempt = 0;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let pongTimer: ReturnType<typeof setTimeout> | null = null;
  let stableTimer: ReturnType<typeof setTimeout> | null = null;

  const send = (data: string): boolean => {
    if (socket?.readyState !== OPEN) return false;
    try {
      socket.send(data);
      return true;
    } catch {
      return false;
    }
  };

  const stopHeartbeat = () => {
    if (pingTimer) clearInterval(pingTimer);
    if (pongTimer) clearTimeout(pongTimer);
    if (stableTimer) clearTimeout(stableTimer);
    pingTimer = null;
    pongTimer = null;
    stableTimer = null;
  };

  /** Drops the current socket without waiting for its close handshake. */
  const abandon = (current: WebSocket) => {
    if (socket !== current) return;
    stopHeartbeat();
    socket = null;
    try {
      current.close(4000, "No response.");
    } catch {
      // Already closing.
    }
    scheduleRetry();
  };

  const connect = () => {
    if (closed) return;
    options.onStatus?.(attempt === 0 ? "connecting" : "reconnecting");
    let current: WebSocket;
    try {
      current = createSocket(url);
    } catch {
      scheduleRetry();
      return;
    }
    socket = current;

    current.addEventListener("open", () => {
      if (closed || socket !== current) return;
      stopHeartbeat();
      stableTimer = setTimeout(() => {
        attempt = 0;
      }, STABLE_AFTER_MS);
      pingTimer = setInterval(() => {
        if (!send(PING_MESSAGE) || pongTimer) return;
        pongTimer = setTimeout(() => abandon(current), PONG_TIMEOUT_MS);
      }, PING_INTERVAL_MS);
      options.onOpen?.(send);
      options.onStatus?.("open");
    });
    current.addEventListener("message", (event) => {
      if (socket !== current) return;
      // Any traffic proves the connection is alive.
      if (pongTimer) clearTimeout(pongTimer);
      pongTimer = null;
      if (typeof event.data !== "string" || event.data === PONG_MESSAGE) return;
      options.onMessage?.(event.data);
    });
    current.addEventListener("close", (event) => {
      if (socket !== current) return;
      stopHeartbeat();
      socket = null;
      if (event.code === REPLACED_CLOSE_CODE) {
        closed = true;
        options.onStatus?.("replaced");
        return;
      }
      scheduleRetry();
    });
    // An error is always followed by close, which handles the retry.
  };

  const scheduleRetry = () => {
    if (closed) return;
    attempt += 1;
    options.onStatus?.("reconnecting");
    retryTimer = setTimeout(connect, retryDelay(attempt));
  };

  connect();

  return {
    send,
    close() {
      closed = true;
      if (retryTimer) clearTimeout(retryTimer);
      stopHeartbeat();
      const current = socket;
      socket = null;
      try {
        current?.close(1000, "Closed by page.");
      } catch {
        // Already closed.
      }
    },
  };
}
