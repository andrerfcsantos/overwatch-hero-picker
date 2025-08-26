export type HeroRole = 'TANK' | 'DAMAGE' | 'SUPPORT';

export interface Hero {
  name: string;
  role: HeroRole;
  selected: boolean;
  key: string;
}

export interface HeroState {
  heroes: Record<string, Hero>;
}

export interface SelectedHeroStats {
  selectedHeroes: string[];
  numberOfSelectedHeroes: number;
}
