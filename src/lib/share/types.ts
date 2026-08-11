import { PerkPick } from "@/types/hero";

export type ShareKind =
  | "hero-result"
  | "squad-result"
  | "picker-preset"
  | "squad-preset";

/** Filters and options from the single-hero picker. */
export interface PickerPreset {
  /** Exact selection state. Empty means "nothing selected", which the picker treats as "all heroes". */
  selected: string[];
  showPortrait: boolean;
  showPerks: boolean;
  nonRepeating: boolean;
}

export interface HeroResult {
  heroKey: string | null;
  perks: PerkPick | null;
}

/** Filters and options from the squad generator. */
export interface SquadPreset {
  /** 1-6. */
  size: number;
  force122: boolean;
  force222: boolean;
  randomizePerks: boolean;
  /** Enabled heroes per slot, `null` for an unrestricted slot. One entry per slot. */
  slots: (string[] | null)[];
  /** Player names per slot, empty string when unset. */
  names: string[];
}

export interface SquadResult {
  /** One entry per slot up to the preset size, `null` for an empty slot. */
  heroes: (string | null)[];
  perks: (PerkPick | null)[];
}

/**
 * A result payload is a preset payload plus the roll it produced, which is what
 * lets the share page re-roll using the original filters.
 */
export type SharePayload =
  | { kind: "picker-preset"; picker: PickerPreset }
  | { kind: "hero-result"; picker: PickerPreset; result: HeroResult }
  | { kind: "squad-preset"; squad: SquadPreset }
  | { kind: "squad-result"; squad: SquadPreset; result: SquadResult };
