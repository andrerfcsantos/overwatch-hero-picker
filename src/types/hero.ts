export type HeroRole = "TANK" | "DAMAGE" | "SUPPORT";

export interface Hero {
  name: string;
  role: HeroRole;
  selected: boolean;
  key: string;
}

export interface HeroPerk {
  minor: [string, string];
  major: [string, string];
}

export interface Squad {
  TANK: Hero[];
  DAMAGE: Hero[];
  SUPPORT: Hero[];
}
