import fs from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { getAllHeroes, heroKeys } from "./heroes";
import { spritePositions } from "./spriteMap";

const heroAssetsDir = path.join(process.cwd(), "public/assets/imgs/heroes");

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
