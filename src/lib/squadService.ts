import { Hero, HeroRole, PerkPick, SlotConfig } from "@/types/hero";
import { getAllHeroes, getHeroesByRole } from "@/data/heroes";
import { randomPerkIndices } from "./heroService";

export const MAX_SLOTS = 6;

const ROLES_122: HeroRole[] = [
  "TANK",
  "DAMAGE",
  "DAMAGE",
  "SUPPORT",
  "SUPPORT",
];
const ROLES_222: HeroRole[] = [
  "TANK",
  "TANK",
  "DAMAGE",
  "DAMAGE",
  "SUPPORT",
  "SUPPORT",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function emptySlotConfig(): SlotConfig {
  return { name: "", disabledHeroes: new Set<string>() };
}

export function ensureConfigs(
  configs: SlotConfig[],
  count: number = MAX_SLOTS,
): SlotConfig[] {
  const result = [...configs];
  while (result.length < count) {
    result.push(emptySlotConfig());
  }
  return result;
}

export function pickForSlot(
  disabledHeroes: Set<string>,
  taken: Set<string>,
): Hero | null {
  const all = getAllHeroes();
  let pool = all.filter((h) => !disabledHeroes.has(h.key) && !taken.has(h.key));
  if (pool.length === 0) {
    // Fallback: ignore filters, just avoid duplicates
    pool = all.filter((h) => !taken.has(h.key));
  }
  if (pool.length === 0) return null;
  return pickRandom(pool);
}

function computeFreeHeroes(
  configs: SlotConfig[],
  size: number,
): (Hero | null)[] {
  const result: (Hero | null)[] = [];
  const taken = new Set<string>();
  for (let i = 0; i < size; i++) {
    const cfg = configs[i] || emptySlotConfig();
    const hero = pickForSlot(cfg.disabledHeroes, taken);
    if (hero) taken.add(hero.key);
    result.push(hero);
  }
  return result;
}

function computeForcedRoles(
  configs: SlotConfig[],
  roleSlots: HeroRole[],
): (Hero | null)[] {
  const result: (Hero | null)[] = [];
  const taken = new Set<string>();

  for (let i = 0; i < roleSlots.length; i++) {
    const cfg = configs[i] || emptySlotConfig();
    const roleHeroes = getHeroesByRole(roleSlots[i]);
    let pool = roleHeroes.filter(
      (h) => !cfg.disabledHeroes.has(h.key) && !taken.has(h.key),
    );
    if (pool.length === 0) {
      pool = roleHeroes.filter((h) => !taken.has(h.key));
    }
    if (pool.length === 0) {
      result.push(null);
    } else {
      const hero = pickRandom(pool);
      taken.add(hero.key);
      result.push(hero);
    }
  }
  return result;
}

/**
 * Rolls a squad. Role forcing only applies at the size it is defined for:
 * 1-2-2 at five slots, 2-2-2 at six.
 */
export function computeSquad(
  configs: SlotConfig[],
  size: number,
  force122: boolean,
  force222: boolean,
): (Hero | null)[] {
  const cfgs = ensureConfigs(configs);
  if (force122 && size === 5) return computeForcedRoles(cfgs, ROLES_122);
  if (force222 && size === 6) return computeForcedRoles(cfgs, ROLES_222);
  return computeFreeHeroes(cfgs, size);
}

export function assignPerks(heroes: (Hero | null)[]): Record<string, PerkPick> {
  const assignments: Record<string, PerkPick> = {};
  for (const hero of heroes) {
    if (!hero) continue;
    const pick = randomPerkIndices(hero.key);
    if (pick) assignments[hero.key] = pick;
  }
  return assignments;
}

/**
 * Slot filters as *enabled* hero keys, which is what share links carry. A slot
 * with nothing ruled out becomes `null`, so the common case costs no bytes.
 */
export function enabledFromSlotConfigs(
  configs: SlotConfig[],
): (string[] | null)[] {
  const allKeys = getAllHeroes().map((h) => h.key);
  return ensureConfigs(configs)
    .slice(0, MAX_SLOTS)
    .map((cfg) =>
      cfg.disabledHeroes.size === 0
        ? null
        : allKeys.filter((key) => !cfg.disabledHeroes.has(key)),
    );
}

/**
 * Inverse of {@link enabledFromSlotConfigs}. Heroes released after the link was
 * created are absent from the enabled list and so come back disabled, which
 * keeps the original filter's intent rather than quietly widening it.
 */
export function slotConfigsFromEnabled(
  slots: (string[] | null)[],
  names: string[],
): SlotConfig[] {
  const allKeys = getAllHeroes().map((h) => h.key);
  const configs: SlotConfig[] = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    const enabled = slots[i] ?? null;
    const disabledHeroes =
      enabled === null
        ? new Set<string>()
        : new Set(allKeys.filter((key) => !enabled.includes(key)));
    configs.push({ name: names[i] ?? "", disabledHeroes });
  }
  return configs;
}
