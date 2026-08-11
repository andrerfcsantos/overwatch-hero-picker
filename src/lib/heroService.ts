import { Hero, PerkPick } from "@/types/hero";
import { heroPerks } from "@/data/heroPerks";

function randomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

export function randomHero(
  heroPool: Hero[],
  options: { preventRepeat?: boolean; previousHeroKey?: string } = {},
): Hero {
  const { preventRepeat = false, previousHeroKey = "" } = options;
  let available = heroPool;

  if (preventRepeat && previousHeroKey && heroPool.length > 1) {
    const filtered = heroPool.filter((h) => h.key !== previousHeroKey);
    if (filtered.length > 0) {
      available = filtered;
    }
  }

  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Picks perks as indices rather than strings so a roll can be put in a share
 * link. Returns null for heroes with no perk data.
 */
export function randomPerkIndices(heroKey: string): PerkPick | null {
  const perks = heroPerks[heroKey];
  if (!perks) return null;
  return {
    minor: randomIndex(perks.minor.length),
    major: randomIndex(perks.major.length),
  };
}

/**
 * Resolves perk indices back to their labels. Returns null when the hero has no
 * perk data or an index is out of range — which happens when a share link
 * predates a change to the perk lists. Showing nothing beats showing the wrong
 * perk.
 */
export function perksFromIndices(
  heroKey: string,
  pick: PerkPick | null,
): { minor: string; major: string } | null {
  if (!pick) return null;
  const perks = heroPerks[heroKey];
  if (!perks) return null;
  const minor = perks.minor[pick.minor];
  const major = perks.major[pick.major];
  if (minor === undefined || major === undefined) return null;
  return { minor, major };
}
