import { describe, expect, test } from "vite-plus/test";

import { encodeShare } from "@/lib/share/codec";
import { PickerPreset } from "@/lib/share/types";
import {
  DEFAULT_OVERLAY_PICKER,
  matchesShortcut,
  overlayUrl,
  parseShortcut,
  readOverlayConfig,
} from "./overlay";

function keyEvent(
  key: string,
  mods: Partial<{
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
  }> = {},
) {
  return {
    key,
    ctrlKey: mods.ctrl ?? false,
    altKey: mods.alt ?? false,
    shiftKey: mods.shift ?? false,
    metaKey: mods.meta ?? false,
  };
}

describe("parseShortcut", () => {
  test("reads a single key, case-insensitively", () => {
    expect(parseShortcut("F8")).toEqual({
      key: "f8",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
    });
    expect(parseShortcut("n")?.key).toBe("n");
  });

  test("reads modifiers in any order", () => {
    expect(parseShortcut("shift+CTRL+h")).toEqual({
      key: "h",
      ctrl: true,
      alt: false,
      shift: true,
      meta: false,
    });
  });

  test("accepts the plus key itself", () => {
    expect(parseShortcut("ctrl++")).toMatchObject({ key: "+", ctrl: true });
  });

  test("rejects empty, modifier-only and multi-key values", () => {
    expect(parseShortcut(null)).toBeNull();
    expect(parseShortcut("")).toBeNull();
    expect(parseShortcut("ctrl")).toBeNull();
    expect(parseShortcut("a+b")).toBeNull();
    expect(parseShortcut("ctrl+")).toBeNull();
  });
});

describe("matchesShortcut", () => {
  test("matches the key with exactly its modifiers", () => {
    const shortcut = parseShortcut("ctrl+shift+h")!;
    expect(
      matchesShortcut(keyEvent("H", { ctrl: true, shift: true }), shortcut),
    ).toBe(true);
    expect(matchesShortcut(keyEvent("h", { ctrl: true }), shortcut)).toBe(
      false,
    );
    expect(
      matchesShortcut(
        keyEvent("H", { ctrl: true, shift: true, alt: true }),
        shortcut,
      ),
    ).toBe(false);
  });

  test("a plain key does not fire with ctrl held", () => {
    const shortcut = parseShortcut("n")!;
    expect(matchesShortcut(keyEvent("n"), shortcut)).toBe(true);
    expect(matchesShortcut(keyEvent("n", { ctrl: true }), shortcut)).toBe(
      false,
    );
  });

  test("shift is implied for printable characters that need it", () => {
    expect(
      matchesShortcut(keyEvent("?", { shift: true }), parseShortcut("?")!),
    ).toBe(true);
  });

  test("shift is exact for named keys", () => {
    const shortcut = parseShortcut("F8")!;
    expect(matchesShortcut(keyEvent("F8"), shortcut)).toBe(true);
    expect(matchesShortcut(keyEvent("F8", { shift: true }), shortcut)).toBe(
      false,
    );
  });

  test("space can be spelled out", () => {
    expect(matchesShortcut(keyEvent(" "), parseShortcut("space")!)).toBe(true);
  });
});

describe("readOverlayConfig", () => {
  const picker: PickerPreset = {
    selected: ["ana", "mercy"],
    showPortrait: false,
    showPerks: true,
    nonRepeating: true,
  };

  test("falls back to every hero when the URL carries no filters", () => {
    expect(readOverlayConfig("")).toEqual({
      ok: true,
      picker: DEFAULT_OVERLAY_PICKER,
      shortcut: null,
    });
  });

  test("round-trips the filters and options in an overlay link", () => {
    const url = new URL(overlayUrl(picker), "https://example.com");
    expect(url.pathname).toBe("/overlay");
    const config = readOverlayConfig(url.search);
    expect(config).toEqual({ ok: true, picker, shortcut: null });
  });

  test("reads the optional test key alongside the filters", () => {
    const url = new URL(overlayUrl(picker), "https://example.com");
    url.searchParams.set("key", "F8");
    const config = readOverlayConfig(url.search);
    expect(config.ok && config.shortcut?.key).toBe("f8");
  });

  test("keeps a literal + in the key as a separator, as typed in a URL", () => {
    // URLSearchParams would decode "+" to a space and lose the separators.
    const typed = readOverlayConfig("?key=ctrl+shift+h");
    expect(typed.ok && typed.shortcut).toMatchObject({
      key: "h",
      ctrl: true,
      shift: true,
    });
    const encoded = readOverlayConfig("?key=ctrl%2Bshift%2Bh");
    expect(encoded.ok && encoded.shortcut).toMatchObject({
      key: "h",
      ctrl: true,
    });
    const plusKey = readOverlayConfig("?key=ctrl%2B%2B");
    expect(plusKey.ok && plusKey.shortcut).toMatchObject({
      key: "+",
      ctrl: true,
    });
  });

  test("ignores a key param that is not valid percent-encoding", () => {
    expect(readOverlayConfig("?key=%E0%A4%A")).toMatchObject({
      ok: true,
      shortcut: null,
    });
  });

  test("accepts the filters inside a hero-result link", () => {
    const encoded = encodeShare({
      kind: "hero-result",
      picker,
      result: { heroKey: "ana", perks: null },
    });
    expect(readOverlayConfig(`?d=${encoded}`)).toMatchObject({
      ok: true,
      picker,
    });
  });

  test("rejects squad payloads and garbage", () => {
    const squad = encodeShare({
      kind: "squad-preset",
      squad: {
        size: 1,
        force122: false,
        force222: false,
        randomizePerks: false,
        slots: [null],
        names: [""],
      },
    });
    expect(readOverlayConfig(`?d=${squad}`).ok).toBe(false);
    expect(readOverlayConfig("?d=not-a-payload").ok).toBe(false);
  });
});
