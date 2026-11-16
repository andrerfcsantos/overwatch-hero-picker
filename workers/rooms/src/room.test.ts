import { afterEach, describe, expect, test, vi } from "vite-plus/test";

// Lives beside the Worker, not in src/: it imports the Room, which needs the
// Workers runtime types that only `npm run rooms:check` loads.

// The Room runs on the Workers runtime. Only the pieces it touches here are
// stood in for: the base class, the ping auto-response and the socket API.
vi.mock("cloudflare:workers", () => ({
  DurableObject: class {
    constructor(
      protected ctx: unknown,
      protected env: unknown,
    ) {}
  },
}));
vi.stubGlobal(
  "WebSocketRequestResponsePair",
  class {
    constructor(
      readonly request: string,
      readonly response: string,
    ) {}
  },
);

const { Room } = await import("./index");
const { REROLL_MESSAGE, controlKeyFor, generateRoomSecret } =
  await import("../../../src/lib/rooms/protocol");

const OPEN = 1;

interface FakeSocket {
  readyState: number;
  sent: string[];
  closed: number | null;
  attachment: unknown;
  send(data: string): void;
  close(code: number): void;
  deserializeAttachment(): unknown;
  serializeAttachment(value: unknown): void;
}

function fakeSocket(attachment: unknown): FakeSocket {
  return {
    readyState: OPEN,
    sent: [],
    closed: null,
    attachment,
    send(data) {
      this.sent.push(data);
    },
    close(code) {
      this.closed = code;
    },
    deserializeAttachment() {
      return this.attachment;
    },
    serializeAttachment(value) {
      this.attachment = value;
    },
  };
}

/** A limiter whose answers are released by hand, in any order. */
function deferredLimiter() {
  const pending: Array<() => void> = [];
  return {
    pending,
    limit: () =>
      new Promise<{ success: boolean }>((resolve) =>
        pending.push(() => resolve({ success: true })),
      ),
  };
}

async function roomWithOverlay() {
  const control = await controlKeyFor(generateRoomSecret());
  const overlay = fakeSocket({ role: "publisher", connectedAt: 1 });
  const sockets: FakeSocket[] = [overlay];
  const storage = new Map<string, unknown>([["control", control]]);
  const ctx = {
    setWebSocketAutoResponse: () => {},
    getWebSockets: (tag?: string) =>
      sockets.filter(
        (socket) =>
          !tag || (socket.attachment as { role: string }).role === tag,
      ),
    storage: { get: async (key: string) => storage.get(key) },
  };
  const rollRequests = deferredLimiter();
  const env = { ROLL_REQUESTS: rollRequests };
  const room = new Room(ctx as never, env as never);
  const companion = () => {
    const socket = fakeSocket({
      role: "viewer",
      control,
      tokens: 10,
      refilledAt: 0,
      connectedAt: 2,
      ip: "203.0.113.7",
    });
    sockets.push(socket);
    return socket;
  };
  return { room, overlay, companion, rollRequests };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Room roll requests", () => {
  test("two requests at once pass one roll, whatever order their checks finish in", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(100_000);
    const { room, overlay, companion, rollRequests } = await roomWithOverlay();
    const first = room.webSocketMessage(companion() as never, REROLL_MESSAGE);
    vi.setSystemTime(100_001);
    const second = room.webSocketMessage(companion() as never, REROLL_MESSAGE);
    // The later request's limit check comes back first.
    rollRequests.pending[1]();
    await second;
    rollRequests.pending[0]();
    await first;
    expect(overlay.sent).toEqual([REROLL_MESSAGE]);
  });

  test("a request after the gap goes through", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(100_000);
    const { room, overlay, companion, rollRequests } = await roomWithOverlay();
    const first = room.webSocketMessage(companion() as never, REROLL_MESSAGE);
    rollRequests.pending[0]();
    await first;
    vi.setSystemTime(102_000);
    const second = room.webSocketMessage(companion() as never, REROLL_MESSAGE);
    rollRequests.pending[1]();
    await second;
    expect(overlay.sent).toEqual([REROLL_MESSAGE, REROLL_MESSAGE]);
  });
});
