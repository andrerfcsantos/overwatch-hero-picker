import { describe, expect, test } from "vite-plus/test";

import { SUB_ROLES, getHeroesBySubRole, getRankedHeroes } from "@/data/heroes";
import { buildDefaultPresets } from "./defaults";
import { SHORTCUT_COUNT, shortcutForIndex } from "./types";

describe("default presets", () => {
  test("leads with Ranked, then one preset per sub-role in game order", () => {
    const presets = buildDefaultPresets();
    expect(presets).toHaveLength(SUB_ROLES.length + 1);
    expect(presets[0].name).toBe("Ranked");
    expect(presets.slice(1).map((p) => p.name)).toEqual(
      SUB_ROLES.map((s) => s.label),
    );
  });

  test("holds the Competitive Play pool in Ranked", () => {
    const [ranked] = buildDefaultPresets();
    expect([...ranked.heroes].sort()).toEqual(
      getRankedHeroes()
        .map((h) => h.key)
        .sort(),
    );
  });

  test("holds exactly its own members in each sub-role preset", () => {
    const presets = buildDefaultPresets();
    SUB_ROLES.forEach((subRole, index) => {
      expect([...presets[index + 1].heroes].sort()).toEqual(
        getHeroesBySubRole(subRole.key)
          .map((h) => h.key)
          .sort(),
      );
    });
  });

  test("keeps ids unique, so restoring them cannot duplicate a preset", () => {
    const ids = buildDefaultPresets().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("has no empty preset", () => {
    for (const preset of buildDefaultPresets()) {
      expect(preset.heroes.length).toBeGreaterThan(0);
    }
  });
});

describe("shortcutForIndex", () => {
  test("numbers the first ten presets 1-9 and then 0", () => {
    const keys = Array.from({ length: SHORTCUT_COUNT }, (_, i) =>
      shortcutForIndex(i),
    );
    expect(keys).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]);
  });

  test("gives nothing to presets outside the shortcut range", () => {
    expect(shortcutForIndex(SHORTCUT_COUNT)).toBeNull();
    expect(shortcutForIndex(-1)).toBeNull();
  });
});
