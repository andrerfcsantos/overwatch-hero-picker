import { describe, expect, test } from "vite-plus/test";

import { bytesToBase64Url, checksum8 } from "./binary";
import {
  MAX_NAME_LENGTH,
  decodeShare,
  encodeShare,
  tryDecodeShare,
} from "./codec";
import { SHARE_HERO_ORDER } from "./heroOrder";
import { PickerPreset, SharePayload, SquadPreset } from "./types";

const picker: PickerPreset = {
  selected: ["reinhardt", "ana", "tracer"],
  showPortrait: true,
  showPerks: true,
  nonRepeating: false,
};

const squad: SquadPreset = {
  size: 5,
  force122: true,
  force222: false,
  randomizePerks: true,
  slots: [null, ["ana", "kiriko"], null, null, null, null],
  names: ["", "", "", "", "", ""],
};

/** Builds a blob from raw body bytes, appending the checksum the codec expects. */
function blobFrom(body: number[]): string {
  const bytes = Uint8Array.from([...body, checksum8(Uint8Array.from(body))]);
  return bytesToBase64Url(bytes);
}

function roundTrip(payload: SharePayload): SharePayload {
  return decodeShare(encodeShare(payload));
}

describe("share codec", () => {
  test("round-trips a picker preset", () => {
    expect(roundTrip({ kind: "picker-preset", picker })).toEqual({
      kind: "picker-preset",
      picker: { ...picker, selected: ["reinhardt", "tracer", "ana"] },
    });
  });

  test("round-trips a hero result with perks", () => {
    const payload: SharePayload = {
      kind: "hero-result",
      picker,
      result: { heroKey: "reinhardt", perks: { minor: 1, major: 0 } },
    };
    const decoded = roundTrip(payload);
    expect(decoded.kind).toBe("hero-result");
    expect(decoded).toMatchObject({
      result: { heroKey: "reinhardt", perks: { minor: 1, major: 0 } },
    });
  });

  test("round-trips a hero result without perks", () => {
    const decoded = roundTrip({
      kind: "hero-result",
      picker: { ...picker, showPerks: false },
      result: { heroKey: "juno", perks: null },
    });
    expect(decoded).toMatchObject({
      result: { heroKey: "juno", perks: null },
    });
  });

  test("preserves an empty selection", () => {
    const decoded = roundTrip({
      kind: "picker-preset",
      picker: { ...picker, selected: [] },
    });
    expect(decoded).toMatchObject({ picker: { selected: [] } });
  });

  test("preserves a full selection", () => {
    const all = [...SHARE_HERO_ORDER];
    const decoded = roundTrip({
      kind: "picker-preset",
      picker: { ...picker, selected: all },
    });
    expect(decoded).toMatchObject({ picker: { selected: all } });
  });

  test("round-trips a squad result with filters, names and perks", () => {
    const payload: SharePayload = {
      kind: "squad-result",
      squad: { ...squad, names: ["Andre", "", "Sam", "", "", ""] },
      result: {
        heroes: ["reinhardt", "ana", null, "tracer", "juno"],
        perks: [
          { minor: 0, major: 1 },
          null,
          null,
          { minor: 1, major: 1 },
          null,
        ],
      },
    };
    expect(roundTrip(payload)).toEqual(payload);
  });

  test("keeps unrestricted slots distinct from fully-disabled ones", () => {
    const decoded = roundTrip({
      kind: "squad-preset",
      squad: { ...squad, slots: [null, [], null, null, null, null] },
    });
    expect(decoded).toMatchObject({
      squad: { slots: [null, [], null, null, null, null] },
    });
  });

  test("trims and caps player names", () => {
    const long = "x".repeat(MAX_NAME_LENGTH + 10);
    const decoded = roundTrip({
      kind: "squad-preset",
      squad: { ...squad, names: ["  spaced  ", long, "", "", "", ""] },
    });
    expect(decoded).toMatchObject({
      squad: { names: ["spaced", "x".repeat(MAX_NAME_LENGTH), "", "", "", ""] },
    });
  });

  test("handles non-ascii names", () => {
    const decoded = roundTrip({
      kind: "squad-preset",
      squad: { ...squad, names: ["Torbjörn 🔨", "", "", "", "", ""] },
    });
    expect(decoded).toMatchObject({
      squad: { names: ["Torbjörn 🔨", "", "", "", "", ""] },
    });
  });

  test("leaks no hero names into the encoded link", () => {
    const encoded = encodeShare({
      kind: "hero-result",
      picker,
      result: { heroKey: "reinhardt", perks: { minor: 0, major: 0 } },
    });
    expect(encoded.toLowerCase()).not.toContain("reinhardt");
    expect(encoded.toLowerCase()).not.toContain("rein");
  });

  test("keeps links short", () => {
    const heroLink = encodeShare({
      kind: "hero-result",
      picker,
      result: { heroKey: "reinhardt", perks: { minor: 0, major: 0 } },
    });
    const squadLink = encodeShare({
      kind: "squad-result",
      squad,
      result: {
        heroes: ["reinhardt", "ana", "mei", "tracer", "juno"],
        perks: Array.from({ length: 5 }, () => ({ minor: 0, major: 1 })),
      },
    });
    expect(heroLink.length).toBeLessThanOrEqual(24);
    expect(squadLink.length).toBeLessThanOrEqual(64);
  });
});

describe("share codec failure handling", () => {
  test("rejects a payload that is not base64url", () => {
    expect(tryDecodeShare("not valid!!")).toEqual({
      ok: false,
      reason: "malformed",
    });
  });

  test("rejects an empty payload", () => {
    expect(tryDecodeShare(null)).toEqual({ ok: false, reason: "malformed" });
    expect(tryDecodeShare("")).toEqual({ ok: false, reason: "malformed" });
  });

  test("rejects a truncated payload", () => {
    const encoded = encodeShare({ kind: "picker-preset", picker });
    expect(tryDecodeShare(encoded.slice(0, 4)).ok).toBe(false);
  });

  test("detects a mangled character instead of decoding a different hero", () => {
    const encoded = encodeShare({
      kind: "hero-result",
      picker,
      result: { heroKey: "reinhardt", perks: null },
    });
    const swapped = encoded[0] === "A" ? "B" : "A";
    const mangled = swapped + encoded.slice(1);
    expect(tryDecodeShare(mangled).ok).toBe(false);
  });

  test("reports a newer format version distinctly", () => {
    // version 2, kind 0 (hero-result)
    expect(tryDecodeShare(blobFrom([0x20, 0x00, 0x00]))).toEqual({
      ok: false,
      reason: "unsupported-version",
    });
  });

  test("rejects an unknown kind", () => {
    expect(tryDecodeShare(blobFrom([0x1f, 0x00, 0x00]))).toEqual({
      ok: false,
      reason: "malformed",
    });
  });

  test("treats heroes missing from an older, shorter mask as unselected", () => {
    // picker-preset, no flags, 1-byte mask selecting share indices 0 and 2.
    const decoded = decodeShare(blobFrom([0x12, 0x00, 0x01, 0b00000101]));
    expect(decoded).toEqual({
      kind: "picker-preset",
      picker: {
        selected: [SHARE_HERO_ORDER[0], SHARE_HERO_ORDER[2]],
        showPortrait: false,
        showPerks: false,
        nonRepeating: false,
      },
    });
  });

  test("ignores mask bits for heroes this build does not know", () => {
    const overlong = Array.from({ length: 16 }, () => 0xff);
    const decoded = decodeShare(
      blobFrom([0x12, 0x00, overlong.length, ...overlong]),
    );
    expect(decoded).toMatchObject({
      picker: { selected: [...SHARE_HERO_ORDER] },
    });
  });
});
