import { Hero, HeroRole, Squad } from "@/types/hero";
import { heroPerks } from "@/data/heroPerks";

function randomFromList<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function popRandomFromArray<T>(list: T[]): T {
  const idx = Math.floor(Math.random() * list.length);
  return list.splice(idx, 1)[0];
}

function popNRandomFromArray<T>(list: T[], n: number): T[] {
  const res: T[] = [];
  const copy = [...list];
  while (n > 0 && copy.length > 0) {
    res.push(popRandomFromArray(copy));
    n--;
  }
  return res;
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

export function getRandomHeroPerks(heroKey: string): [string, string] {
  const perks = heroPerks[heroKey];
  if (!perks) return ["", ""];
  return [randomFromList(perks.minor), randomFromList(perks.major)];
}

export function randomSquad(heroesByRole: {
  TANK: Hero[];
  DAMAGE: Hero[];
  SUPPORT: Hero[];
}): Squad {
  return randomSquadWithRoles(heroesByRole, [
    "TANK",
    "DAMAGE",
    "DAMAGE",
    "SUPPORT",
    "SUPPORT",
  ]);
}

export function randomSquadWithRoles(
  heroesByRole: { TANK: Hero[]; DAMAGE: Hero[]; SUPPORT: Hero[] },
  roles?: HeroRole[],
): Squad {
  const allByRole = {
    TANK: [...heroesByRole.TANK],
    DAMAGE: [...heroesByRole.DAMAGE],
    SUPPORT: [...heroesByRole.SUPPORT],
  };
  const selectedByRole = {
    TANK: allByRole.TANK.filter((h) => h.selected),
    DAMAGE: allByRole.DAMAGE.filter((h) => h.selected),
    SUPPORT: allByRole.SUPPORT.filter((h) => h.selected),
  };

  const res: Squad = { TANK: [], DAMAGE: [], SUPPORT: [] };

  const roleSet: HeroRole[] = ["TANK", "DAMAGE", "SUPPORT"];
  let rolesToGenerate: HeroRole[];

  if (roles && roles.length > 0) {
    rolesToGenerate = [...roles];
  } else {
    rolesToGenerate = [];
    for (let i = 0; i < 5; i++) {
      rolesToGenerate.push(randomFromList(roleSet));
    }
  }

  for (let i = 0; i < 5; i++) {
    const role = popRandomFromArray(rolesToGenerate);
    let hero: Hero;

    if (selectedByRole[role].length > 0) {
      hero = popRandomFromArray(selectedByRole[role]);
      const idx = allByRole[role].findIndex((h) => h.key === hero.key);
      if (idx !== -1) allByRole[role].splice(idx, 1);
    } else {
      hero = popRandomFromArray(allByRole[role]);
    }

    res[role].push(hero);
  }

  return res;
}
