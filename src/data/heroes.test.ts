import fs from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { SHARE_HERO_ORDER } from "@/lib/share/heroOrder";
import { getAllHeroes, heroKeys } from "./heroes";
import { heroPerks } from "./heroPerks";
import { spritePositions } from "./spriteMap";

const heroAssetsDir = path.join(process.cwd(), "public/assets/imgs/heroes");

/**
 * Snapshot of the share index space as first published. Share links encode hero
 * indices against it, so entries may only be APPENDED — never reordered or
 * removed. Add new heroes to the end of SHARE_HERO_ORDER and leave this alone.
 */
const FROZEN_SHARE_ORDER_PREFIX = [
  "dva",
  "orisa",
  "reinhardt",
  "roadhog",
  "winston",
  "wreckingball",
  "zarya",
  "doomfist",
  "sigma",
  "junkerqueen",
  "ramattra",
  "mauga",
  "hazard",
  "domina",
  "bastion",
  "genji",
  "hanzo",
  "junkrat",
  "cassidy",
  "mei",
  "pharah",
  "reaper",
  "shion",
  "sierra",
  "soldier76",
  "sombra",
  "symmetra",
  "torbjorn",
  "tracer",
  "widowmaker",
  "ashe",
  "echo",
  "sojourn",
  "venture",
  "freja",
  "anran",
  "emre",
  "vendetta",
  "ana",
  "brigitte",
  "lucio",
  "mercy",
  "moira",
  "zenyatta",
  "baptiste",
  "kiriko",
  "lifeweaver",
  "illari",
  "juno",
  "jetpackcat",
  "mizuki",
  "wuyang",
];

describe("hero data", () => {
  test("includes Shion as a selectable Damage hero", () => {
    expect(getAllHeroes()).toContainEqual(
      expect.objectContaining({
        key: "shion",
        name: "Shion",
        role: "DAMAGE",
        selected: true,
      }),
    );
  });

  test("has perk data for every hero", () => {
    for (const key of heroKeys) {
      expect(heroPerks[key]).toBeDefined();
      // Share links pack a perk choice into 4 bits per tier.
      expect(heroPerks[key].minor.length).toBeGreaterThan(0);
      expect(heroPerks[key].minor.length).toBeLessThanOrEqual(16);
      expect(heroPerks[key].major.length).toBeGreaterThan(0);
      expect(heroPerks[key].major.length).toBeLessThanOrEqual(16);
    }
  });

  test("has sprite map entries and webp assets for every hero", () => {
    for (const key of heroKeys) {
      expect(spritePositions[key]).toBeDefined();
      expect(
        fs.existsSync(path.join(heroAssetsDir, "icons", `${key}.webp`)),
      ).toBe(true);
      expect(
        fs.existsSync(path.join(heroAssetsDir, "portraits", `${key}.webp`)),
      ).toBe(true);
    }
  });
});

describe("share hero order", () => {
  test("keeps the published index space unchanged", () => {
    expect(SHARE_HERO_ORDER.slice(0, FROZEN_SHARE_ORDER_PREFIX.length)).toEqual(
      FROZEN_SHARE_ORDER_PREFIX,
    );
  });

  test("has no duplicate entries", () => {
    expect(new Set(SHARE_HERO_ORDER).size).toBe(SHARE_HERO_ORDER.length);
  });

  test("covers every hero, so any hero can be shared", () => {
    const shareable = new Set(SHARE_HERO_ORDER);
    for (const key of heroKeys) {
      expect(shareable.has(key)).toBe(true);
    }
  });

  test("stays within the addressable index range", () => {
    // 255 is reserved as the "no hero" marker.
    expect(SHARE_HERO_ORDER.length).toBeLessThanOrEqual(255);
  });
});
