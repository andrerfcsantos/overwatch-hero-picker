import { afterEach, describe, expect, test, vi } from "vite-plus/test";

import { getAllHeroes } from "@/data/heroes";
import { generateRoomSecret, viewIdFor } from "@/lib/rooms/protocol";
import { encodeShare } from "@/lib/share/codec";
import { PickerPreset } from "@/lib/share/types";
import {
  DEFAULT_OVERLAY_PICKER,
  matchesShortcut,
  overlayUrl,
  OVERLAY_SIZES,
  LAST_HERO_STORAGE_KEY,
  companionUrl,
  nextOverlayHero,
  parseOverlayScale,
  parseShortcut,
  readLastOverlayHero,
  readOverlayConfig,
  rememberOverlayHero,
} from "./overlay";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
  };
}

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
      scale: 1,
      room: null,
    });
  });

  test("round-trips the filters and options in an overlay link", () => {
    const url = new URL(overlayUrl(picker), "https://example.com");
    expect(url.pathname).toBe("/overlay");
    const config = readOverlayConfig(url.search);
    expect(config).toEqual({
      ok: true,
      picker,
      shortcut: null,
      scale: 1,
      room: null,
    });
  });

  test("leaves the default size out of the link and carries the others", () => {
    expect(overlayUrl(picker, "medium")).not.toContain("size=");
    for (const size of OVERLAY_SIZES) {
      const url = new URL(overlayUrl(picker, size.id), "https://example.com");
      const config = readOverlayConfig(url.search);
      expect(config).toMatchObject({ ok: true, picker, scale: size.scale });
    }
  });

  test("carries the companion room's publish secret", () => {
    const room = generateRoomSecret();
    const url = new URL(
      overlayUrl(picker, "large", room),
      "https://example.com",
    );
    expect(readOverlayConfig(url.search)).toMatchObject({
      ok: true,
      picker,
      scale: 1.5,
      room,
    });
    expect(overlayUrl(picker)).not.toContain("room=");
  });

  test("only honours the room key under its literal name", () => {
    const room = generateRoomSecret();
    expect(readOverlayConfig(`?room=${room}`)).toMatchObject({ room });
    // URLSearchParams would decode these names to "room", but analytics
    // redaction would not recognise them, so they must not enable publishing.
    expect(readOverlayConfig(`?%72oom=${room}`)).toMatchObject({ room: null });
    expect(readOverlayConfig(`?ROOM=${room}`)).toMatchObject({ room: null });
  });

  test("ignores a malformed room instead of failing the overlay", () => {
    expect(readOverlayConfig("?room=short")).toMatchObject({
      ok: true,
      room: null,
    });
    expect(readOverlayConfig(`?room=${"x".repeat(80)}`)).toMatchObject({
      ok: true,
      room: null,
    });
  });

  test("builds the companion link from a view id", async () => {
    const view = await viewIdFor(generateRoomSecret());
    const url = new URL(companionUrl(view), "https://example.com");
    expect(url.pathname).toBe("/overlay/companion");
    expect(url.searchParams.get("view")).toBe(view);
  });

  test("sizes the error card for a broken link too", () => {
    expect(readOverlayConfig("?d=garbage&size=large")).toMatchObject({
      ok: false,
      scale: 1.5,
    });
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

describe("parseOverlayScale", () => {
  test("reads presets, case-insensitively", () => {
    expect(parseOverlayScale("small")).toBe(0.75);
    expect(parseOverlayScale("Medium")).toBe(1);
    expect(parseOverlayScale("LARGE")).toBe(1.5);
    expect(parseOverlayScale("xl")).toBe(2);
  });

  test("reads a multiple of the default size", () => {
    expect(parseOverlayScale("1.25")).toBe(1.25);
    expect(parseOverlayScale(".5")).toBe(0.5);
  });

  test("clamps numbers to the supported range", () => {
    expect(parseOverlayScale("0.01")).toBe(0.25);
    expect(parseOverlayScale("100")).toBe(4);
  });

  test("falls back to the default for anything else", () => {
    for (const value of [
      null,
      "",
      "huge",
      "0",
      "-2",
      "1e3",
      "Infinity",
      "2px",
    ]) {
      expect(parseOverlayScale(value)).toBe(1);
    }
  });
});

describe("last overlay hero", () => {
  test("remembers the last hero across reads", () => {
    const storage = memoryStorage();
    expect(readLastOverlayHero(storage)).toBe("");
    rememberOverlayHero("ana", storage);
    expect(readLastOverlayHero(storage)).toBe("ana");
    expect(storage.getItem(LAST_HERO_STORAGE_KEY)).toBe("ana");
  });

  test("never throws when storage is missing or blocked", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readLastOverlayHero(blocked)).toBe("");
    expect(() => rememberOverlayHero("ana", blocked)).not.toThrow();
    expect(readLastOverlayHero(undefined)).toBe("");
  });
});

describe("nextOverlayHero", () => {
  const heroes = getAllHeroes();
  const byKey = (key: string) => heroes.find((hero) => hero.key === key)!;
  const anaAndMercy = [byKey("ana"), byKey("mercy")];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("non-repeating holds across page loads through storage", () => {
    // Each call with previousHeroKey null is a fresh load, as with OBS's
    // "Shutdown source when not visible": only storage links the loads.
    const storage = memoryStorage();
    const shown: string[] = [];
    for (let load = 0; load < 20; load++) {
      const hero = nextOverlayHero(
        anaAndMercy,
        { nonRepeating: true, previousHeroKey: null },
        storage,
      );
      shown.push(hero.key);
    }
    for (let i = 1; i < shown.length; i++) {
      expect(shown[i]).not.toBe(shown[i - 1]);
    }
    expect(readLastOverlayHero(storage)).toBe(shown.at(-1));
  });

  test("the hero shown in this load wins over the remembered one", () => {
    const storage = memoryStorage();
    rememberOverlayHero("ana", storage);
    const hero = nextOverlayHero(
      anaAndMercy,
      { nonRepeating: true, previousHeroKey: "mercy" },
      storage,
    );
    expect(hero.key).toBe("ana");
  });

  test("repeats are allowed when non-repeating mode is off", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const storage = memoryStorage();
    rememberOverlayHero("ana", storage);
    const hero = nextOverlayHero(
      anaAndMercy,
      { nonRepeating: false, previousHeroKey: null },
      storage,
    );
    expect(hero.key).toBe("ana");
  });

  test("a one-hero pool keeps returning its hero", () => {
    const storage = memoryStorage();
    for (let load = 0; load < 3; load++) {
      const hero = nextOverlayHero(
        [byKey("ana")],
        { nonRepeating: true, previousHeroKey: null },
        storage,
      );
      expect(hero.key).toBe("ana");
    }
  });

  test("a remembered hero outside the pool is ignored", () => {
    const storage = memoryStorage();
    rememberOverlayHero("reinhardt", storage);
    const hero = nextOverlayHero(
      anaAndMercy,
      { nonRepeating: true, previousHeroKey: null },
      storage,
    );
    expect(["ana", "mercy"]).toContain(hero.key);
  });

  test("works without storage", () => {
    const hero = nextOverlayHero(
      anaAndMercy,
      { nonRepeating: true, previousHeroKey: null },
      undefined,
    );
    expect(["ana", "mercy"]).toContain(hero.key);
  });
});
