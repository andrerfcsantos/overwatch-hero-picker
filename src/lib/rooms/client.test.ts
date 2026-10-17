import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vite-plus/test";

import { openRoomSocket, retryDelay, roomSocketUrl } from "./client";
import { PING_MESSAGE, PONG_MESSAGE } from "./protocol";

/** Just enough of a WebSocket for the client: listeners, send, close. */
class FakeSocket {
  static instances: FakeSocket[] = [];
  readyState = 0;
  sent: string[] = [];
  closedWith: number | null = null;
  private listeners = new Map<
    string,
    ((event: { data?: unknown }) => void)[]
  >();

  constructor(public url: string) {
    FakeSocket.instances.push(this);
  }

  addEventListener(
    type: string,
    listener: (event: { data?: unknown }) => void,
  ) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close(code = 1000) {
    this.closedWith = code;
    this.readyState = 3;
  }

  // Test controls.
  open() {
    this.readyState = 1;
    this.emit("open");
  }
  receive(data: string) {
    this.emit("message", { data });
  }
  drop() {
    this.readyState = 3;
    this.emit("close");
  }
  private emit(type: string, event: { data?: unknown } = {}) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}

const target = { role: "viewer", viewId: "v".repeat(43) } as const;
const createSocket = (url: string) =>
  new FakeSocket(url) as unknown as WebSocket;
const latest = () => FakeSocket.instances.at(-1)!;

beforeEach(() => {
  FakeSocket.instances = [];
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("roomSocketUrl", () => {
  test("puts exactly one key on the handshake URL", () => {
    expect(
      roomSocketUrl(
        { role: "publisher", secret: "s3cret" },
        "wss://rooms.example",
      ),
    ).toBe("wss://rooms.example/v1/ws?room=s3cret");
    expect(
      roomSocketUrl({ role: "viewer", viewId: "v1ew" }, "ws://127.0.0.1:8787"),
    ).toBe("ws://127.0.0.1:8787/v1/ws?view=v1ew");
  });
});

describe("retryDelay", () => {
  test("doubles from about a second up to about thirty, with jitter", () => {
    expect(retryDelay(1, () => 0.5)).toBe(1_000);
    expect(retryDelay(2, () => 0.5)).toBe(2_000);
    expect(retryDelay(10, () => 0.5)).toBe(30_000);
    expect(retryDelay(1, () => 0)).toBe(750);
    expect(retryDelay(10, () => 1)).toBe(37_500);
  });
});

describe("openRoomSocket", () => {
  test("replaces a socket that stops answering pings", () => {
    const statuses: string[] = [];
    const room = openRoomSocket({
      target,
      createSocket,
      onStatus: (s) => statuses.push(s),
    });
    const first = latest();
    first.open();

    vi.advanceTimersByTime(25_000);
    expect(first.sent).toEqual([PING_MESSAGE]);
    vi.advanceTimersByTime(10_000);
    expect(first.closedWith).toBe(4000);
    expect(statuses.at(-1)).toBe("reconnecting");

    vi.advanceTimersByTime(2_000);
    expect(FakeSocket.instances).toHaveLength(2);
    room.close();
  });

  test("keeps a socket whose pings are answered", () => {
    const room = openRoomSocket({ target, createSocket });
    const socket = latest();
    socket.open();
    for (let i = 0; i < 5; i++) {
      vi.advanceTimersByTime(25_000);
      socket.receive(PONG_MESSAGE);
    }
    expect(socket.closedWith).toBeNull();
    expect(FakeSocket.instances).toHaveLength(1);
    room.close();
  });

  test("counts any message as a sign of life", () => {
    const room = openRoomSocket({ target, createSocket });
    const socket = latest();
    socket.open();
    vi.advanceTimersByTime(25_000);
    socket.receive('{"type":"presence","overlayOnline":true}');
    vi.advanceTimersByTime(10_000);
    expect(socket.closedWith).toBeNull();
    room.close();
  });

  test("keeps pongs away from the page", () => {
    const messages: string[] = [];
    const room = openRoomSocket({
      target,
      createSocket,
      onMessage: (m) => messages.push(m),
    });
    latest().open();
    latest().receive(PONG_MESSAGE);
    latest().receive('{"type":"presence","overlayOnline":false}');
    expect(messages).toEqual(['{"type":"presence","overlayOnline":false}']);
    room.close();
  });

  test("reconnects after a drop and hands the new socket to onOpen", () => {
    const opened: number[] = [];
    const room = openRoomSocket({
      target,
      createSocket,
      onOpen: (send) => {
        opened.push(FakeSocket.instances.length);
        send("hello");
      },
    });
    latest().open();
    latest().drop();
    vi.advanceTimersByTime(2_000);
    latest().open();
    expect(opened).toEqual([1, 2]);
    expect(latest().sent).toEqual(["hello"]);
    room.close();
  });

  test("close() stops for good, even mid-retry", () => {
    const room = openRoomSocket({ target, createSocket });
    latest().drop();
    room.close();
    vi.advanceTimersByTime(120_000);
    expect(FakeSocket.instances).toHaveLength(1);
  });

  test("send reports whether the message went out", () => {
    const room = openRoomSocket({ target, createSocket });
    expect(room.send("early")).toBe(false);
    latest().open();
    expect(room.send("now")).toBe(true);
    expect(latest().sent).toEqual(["now"]);
    room.close();
  });
});
