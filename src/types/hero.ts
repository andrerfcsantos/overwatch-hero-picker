export type HeroRole = "TANK" | "DAMAGE" | "SUPPORT";

export interface Hero {
  name: string;
  role: HeroRole;
  selected: boolean;
  key: string;
}

/**
 * Perk options for a hero. Both lists are APPEND-ONLY: share links encode a
 * perk choice as an index into them, so reordering would make old links show
 * the wrong perk. Add new perks at the end.
 */
export interface HeroPerk {
  minor: readonly string[];
  major: readonly string[];
}

/** A chosen perk pair, stored as indices into the hero's `HeroPerk` lists. */
export interface PerkPick {
  minor: number;
  major: number;
}

/** Per-slot squad configuration: a player name and the heroes ruled out. */
export interface SlotConfig {
  name: string;
  disabledHeroes: Set<string>;
}

export interface Squad {
  TANK: Hero[];
  DAMAGE: Hero[];
  SUPPORT: Hero[];
}
