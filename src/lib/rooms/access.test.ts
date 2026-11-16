import { describe, expect, test } from "vite-plus/test";

import {
  companionControl,
  keysMatch,
  readHandshake,
  rerollOutcome,
} from "../../../workers/rooms/src/access";
import {
  REROLL_MIN_INTERVAL_MS,
  controlKeyFor,
  generateRoomSecret,
  viewIdFor,
} from "./protocol";

async function room() {
  const secret = generateRoomSecret();
  return {
    secret,
    view: await viewIdFor(secret),
    control: await controlKeyFor(secret),
  };
}

describe("readHandshake", () => {
  test("an overlay joins its room with the control key worked out", async () => {
    const { secret, view, control } = await room();
    expect(await readHandshake({ secret, view: null, control: null })).toEqual({
      roomName: view,
      role: "publisher",
      control,
    });
  });

  test("a companion joins by view id, with or without a key", async () => {
    const { view, control } = await room();
    expect(await readHandshake({ secret: null, view, control: null })).toEqual({
      roomName: view,
      role: "viewer",
      control: null,
    });
    expect(await readHandshake({ secret: null, view, control })).toEqual({
      roomName: view,
      role: "viewer",
      control,
    });
  });

  test("refuses mixed, missing and malformed keys", async () => {
    const { secret, view, control } = await room();
    for (const params of [
      { secret: null, view: null, control: null },
      { secret, view, control: null },
      // The overlay holds the secret; a control key next to it is not ours.
      { secret, view: null, control },
      { secret: null, view: null, control },
      { secret: "short", view: null, control: null },
      { secret: null, view: "short", control: null },
      { secret: null, view, control: "short" },
    ]) {
      expect(await readHandshake(params)).toBeNull();
    }
  });
});

describe("companionControl", () => {
  test("drops a key the room knows to be wrong", async () => {
    const real = await room();
    const other = await room();
    expect(companionControl(real.control, real.control)).toBe(real.control);
    expect(companionControl(other.control, real.control)).toBeNull();
    expect(companionControl(null, real.control)).toBeNull();
  });

  test("keeps a claim the room cannot check yet", async () => {
    const { control } = await room();
    expect(companionControl(control, null)).toBe(control);
  });
});

describe("keysMatch", () => {
  test("compares whole keys", () => {
    expect(keysMatch("abc", "abc")).toBe(true);
    expect(keysMatch("abc", "abd")).toBe(false);
    expect(keysMatch("abc", "abcd")).toBe(false);
    expect(keysMatch("", "")).toBe(true);
  });
});

describe("rerollOutcome", () => {
  const now = 100_000;

  test("passes on a request with the room's key while the overlay is on", async () => {
    const { control } = await room();
    expect(
      rerollOutcome({
        claimed: control,
        expected: control,
        publishers: 1,
        lastRerollAt: 0,
        now,
      }),
    ).toBe("sent");
  });

  test("refuses a missing or wrong key", async () => {
    const real = await room();
    const other = await room();
    const base = {
      expected: real.control,
      publishers: 1,
      lastRerollAt: 0,
      now,
    };
    expect(rerollOutcome({ ...base, claimed: null })).toBe("denied");
    expect(rerollOutcome({ ...base, claimed: other.control })).toBe("denied");
  });

  test("a room that has not met its overlay says it is offline", async () => {
    const { control } = await room();
    expect(
      rerollOutcome({
        claimed: control,
        expected: null,
        publishers: 0,
        lastRerollAt: 0,
        now,
      }),
    ).toBe("offline");
  });

  test("says offline when no overlay is connected", async () => {
    const { control } = await room();
    expect(
      rerollOutcome({
        claimed: control,
        expected: control,
        publishers: 0,
        lastRerollAt: 0,
        now,
      }),
    ).toBe("offline");
  });

  test("a wrong key is refused before saying whether the overlay is on", async () => {
    const real = await room();
    const other = await room();
    expect(
      rerollOutcome({
        claimed: other.control,
        expected: real.control,
        publishers: 0,
        lastRerollAt: 0,
        now,
      }),
    ).toBe("denied");
  });

  test("is busy until the gap since the last roll has passed", async () => {
    const { control } = await room();
    const base = { claimed: control, expected: control, publishers: 1, now };
    expect(
      rerollOutcome({
        ...base,
        lastRerollAt: now - REROLL_MIN_INTERVAL_MS + 1,
      }),
    ).toBe("busy");
    expect(
      rerollOutcome({ ...base, lastRerollAt: now - REROLL_MIN_INTERVAL_MS }),
    ).toBe("sent");
  });
});
