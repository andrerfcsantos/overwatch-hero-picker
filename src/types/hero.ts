export type HeroRole = "TANK" | "DAMAGE" | "SUPPORT";

/**
 * The game's sub-roles. Each one belongs to a single role, and every hero
 * belongs to exactly one sub-role. See `SUB_ROLES` in `@/data/heroes` for the
 * membership, which is where sub-role changes are made.
 */
export type HeroSubRole =
  // Tank
  | "BRUISER"
  | "INITIATOR"
  | "STALWART"
  // Damage
  | "FLANKER"
  | "RECON"
  | "SHARPSHOOTER"
  | "SPECIALIST"
  // Support
  | "MEDIC"
  | "SURVIVOR"
  | "TACTICIAN";

export interface Hero {
  name: string;
  role: HeroRole;
  subRole: HeroSubRole;
  selected: boolean;
  key: string;
  /**
   * Left out when the hero can be picked in Competitive Play, which is the
   * usual case. Set to `false` for heroes Blizzard has disabled there; the
   * built-in "Ranked" preset is built from this.
   */
  rankedEligible?: boolean;
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
