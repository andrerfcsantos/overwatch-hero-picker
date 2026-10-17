import { describe, expect, test } from "vite-plus/test";

import { getAllHeroes } from "@/data/heroes";
import { heroPerks } from "@/data/heroPerks";
import { isOriginAllowed } from "../../../workers/rooms/src/origins";
import {
  ROLL_BURST,
  takeRollToken,
} from "../../../workers/rooms/src/rateLimit";
import {
  MAX_MESSAGE_BYTES,
  generateRoomSecret,
  isRoomSecret,
  isViewId,
  parsePublisherMessage,
  parseViewerMessage,
  publisherRollMessage,
  viewIdFor,
} from "./protocol";

describe("room ids", () => {
  test("secrets are random, url-safe and recognised", () => {
    const a = generateRoomSecret();
    const b = generateRoomSecret();
    expect(a).not.toBe(b);
    expect(isRoomSecret(a)).toBe(true);
    expect(a).toMatch(/^[A-Za-z0-9_-]{32}$/);
  });

  test("the view id is a stable hash that is not itself a secret", async () => {
    const secret = generateRoomSecret();
    const view = await viewIdFor(secret);
    expect(await viewIdFor(secret)).toBe(view);
    expect(isViewId(view)).toBe(true);
    expect(isRoomSecret(view)).toBe(true); // 43 chars fits the secret shape…
    expect(await viewIdFor(view)).not.toBe(view); // …but hashes to another room.
    expect(isViewId(secret)).toBe(false);
  });

  test("known SHA-256 vector", async () => {
    // sha256("abc"), base64url without padding.
    expect(await viewIdFor("abc")).toBe(
      "ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0",
    );
  });

  test("rejects malformed ids", () => {
    for (const bad of [
      "",
      "short",
      "a".repeat(65),
      "has space".padEnd(40, "x"),
      "+/=".repeat(12),
      null,
      42,
    ]) {
      expect(isRoomSecret(bad)).toBe(false);
      expect(isViewId(bad)).toBe(false);
    }
  });
});

describe("publisher messages", () => {
  test("round-trips a roll", () => {
    const raw = publisherRollMessage("ana", { minor: 1, major: 0 });
    expect(parsePublisherMessage(raw)).toEqual({
      type: "roll",
      roll: { heroKey: "ana", perks: { minor: 1, major: 0 } },
    });
    expect(parsePublisherMessage(publisherRollMessage("ana", null))).toEqual({
      type: "roll",
      roll: { heroKey: "ana", perks: null },
    });
  });

  test("every hero key and perk index the site can roll is accepted", () => {
    for (const hero of getAllHeroes()) {
      const perks = heroPerks[hero.key];
      const minor = perks ? perks.minor.length - 1 : 0;
      const major = perks ? perks.major.length - 1 : 0;
      const raw = publisherRollMessage(hero.key, { minor, major });
      expect(parsePublisherMessage(raw), hero.key).not.toBeNull();
    }
  });

  test("drops the client's own timestamp and extra fields", () => {
    const raw = JSON.stringify({
      type: "roll",
      roll: { heroKey: "ana", perks: null, rolledAt: 1, extra: "<b>x</b>" },
      more: true,
    });
    expect(parsePublisherMessage(raw)).toEqual({
      type: "roll",
      roll: { heroKey: "ana", perks: null },
    });
  });

  test("rejects anything malformed", () => {
    const bad = [
      "",
      "not json",
      "null",
      "[]",
      JSON.stringify({ type: "state" }),
      JSON.stringify({ type: "roll" }),
      JSON.stringify({ type: "roll", roll: { heroKey: "Ana", perks: null } }),
      JSON.stringify({
        type: "roll",
        roll: { heroKey: "<script>", perks: null },
      }),
      JSON.stringify({ type: "roll", roll: { heroKey: "ana" } }),
      JSON.stringify({
        type: "roll",
        roll: { heroKey: "ana", perks: { minor: -1, major: 0 } },
      }),
      JSON.stringify({
        type: "roll",
        roll: { heroKey: "ana", perks: { minor: 1.5, major: 0 } },
      }),
      JSON.stringify({
        type: "roll",
        roll: { heroKey: "ana", perks: { minor: 0, major: 99 } },
      }),
      JSON.stringify({
        type: "roll",
        roll: { heroKey: "a".repeat(33), perks: null },
      }),
      JSON.stringify({
        type: "roll",
        roll: { heroKey: "ana", perks: null },
        pad: "x".repeat(MAX_MESSAGE_BYTES),
      }),
    ];
    for (const raw of bad) expect(parsePublisherMessage(raw), raw).toBeNull();
  });
});

describe("viewer messages", () => {
  const roll = { heroKey: "ana", perks: null, rolledAt: 1_700_000_000_000 };

  test("parses every message the room sends", () => {
    expect(
      parseViewerMessage(
        JSON.stringify({ type: "state", roll, overlayOnline: true }),
      ),
    ).toEqual({ type: "state", roll, overlayOnline: true });
    expect(
      parseViewerMessage(
        JSON.stringify({ type: "state", roll: null, overlayOnline: false }),
      ),
    ).toEqual({ type: "state", roll: null, overlayOnline: false });
    expect(parseViewerMessage(JSON.stringify({ type: "roll", roll }))).toEqual({
      type: "roll",
      roll,
    });
    expect(
      parseViewerMessage(
        JSON.stringify({ type: "presence", overlayOnline: false }),
      ),
    ).toEqual({ type: "presence", overlayOnline: false });
  });

  test("rejects anything malformed", () => {
    const bad = [
      "",
      '{"type":"pong"}',
      JSON.stringify({ type: "state", roll }),
      JSON.stringify({ type: "roll", roll: { ...roll, rolledAt: "now" } }),
      JSON.stringify({ type: "roll", roll: { ...roll, heroKey: "<img>" } }),
      JSON.stringify({ type: "presence", overlayOnline: "yes" }),
    ];
    for (const raw of bad) expect(parseViewerMessage(raw), raw).toBeNull();
  });
});

describe("isOriginAllowed", () => {
  const allowed =
    "https://owheropicker.com,https://www.owheropicker.com, .main-4a3.workers.dev";

  test("allows listed origins and subdomains of a suffix", () => {
    expect(isOriginAllowed("https://owheropicker.com", allowed)).toBe(true);
    expect(isOriginAllowed("https://www.owheropicker.com", allowed)).toBe(true);
    expect(
      isOriginAllowed(
        "https://feature-x-overwatch-hero-picker.main-4a3.workers.dev",
        allowed,
      ),
    ).toBe(true);
  });

  test("refuses everything else", () => {
    for (const origin of [
      null,
      "",
      "null",
      "http://owheropicker.com",
      "https://owheropicker.com.evil.example",
      "https://evilowheropicker.com",
      "http://x.main-4a3.workers.dev",
      "https://main-4a3.workers.dev.evil.example",
      "https://evilmain-4a3.workers.dev",
    ]) {
      expect(isOriginAllowed(origin, allowed), String(origin)).toBe(false);
    }
  });
});

describe("takeRollToken", () => {
  test("allows a burst, then refuses until time refills it", () => {
    let allowance = { tokens: ROLL_BURST, refilledAt: 0 };
    for (let i = 0; i < ROLL_BURST; i++) {
      const result = takeRollToken(allowance, 0);
      expect(result.allowed).toBe(true);
      allowance = result.next;
    }
    const refused = takeRollToken(allowance, 0);
    expect(refused.allowed).toBe(false);
    // Two tokens a second: half a second buys one more roll.
    expect(takeRollToken(refused.next, 500).allowed).toBe(true);
  });

  test("never banks more than a burst", () => {
    const later = takeRollToken({ tokens: 0, refilledAt: 0 }, 3_600_000);
    expect(later.next.tokens).toBe(ROLL_BURST - 1);
  });

  test("a clock going backwards does not mint tokens", () => {
    const result = takeRollToken({ tokens: 0, refilledAt: 1_000 }, 0);
    expect(result.allowed).toBe(false);
  });
});
