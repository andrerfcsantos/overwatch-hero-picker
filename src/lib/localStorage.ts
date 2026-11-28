import { SlotConfig } from "@/types/hero";

/** Reads a flag, falling back to `defaultValue` when unset or unreadable. */
export function getBoolFromLS(key: string, defaultValue: boolean): boolean {
  if (typeof window === "undefined") return defaultValue;
  try {
    const val = localStorage.getItem(key);
    if (val === null) return defaultValue;
    return val === "true";
  } catch {
    // Storage can be blocked outright, in which case reading throws.
    return defaultValue;
  }
}

export function setBoolToLS(key: string, value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Storage can be full or blocked; losing the write is better than throwing.
  }
}

/** Reads a JSON value, treating anything unreadable as "not stored". */
export function getJsonFromLS<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(key);
    if (item === null) return null;
    return JSON.parse(item) as T;
  } catch {
    return null;
  }
}

/**
 * Throws when storage is full or blocked, unlike the helpers around it: what
 * goes through here (presets, the overlay's room secret) is data whose loss
 * the caller has to hear about, not a preference that can quietly fall back.
 */
export function setJsonToLS(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

interface SlotConfigJson {
  name: string;
  disabledHeroes: string[];
}

export function loadSquadSlotConfigs(): SlotConfig[] {
  const raw = getJsonFromLS<SlotConfigJson[]>("squadSlotConfigs");
  if (!raw) return [];
  return raw.map((s) => ({
    name: s.name,
    disabledHeroes: new Set(s.disabledHeroes),
  }));
}

export function saveSquadSlotConfigs(configs: SlotConfig[]): void {
  const json: SlotConfigJson[] = configs.map((s) => ({
    name: s.name,
    disabledHeroes: [...s.disabledHeroes],
  }));
  setJsonToLS("squadSlotConfigs", json);
}

export function loadSquadSize(): number {
  if (typeof window === "undefined") return 5;
  const val = localStorage.getItem("squadSize");
  if (val === null) return 5;
  const n = parseInt(val, 10);
  return n >= 1 && n <= 6 ? n : 5;
}

export function loadSquadForce222(): boolean {
  return getBoolFromLS("squadForce222", true);
}

export function saveSquadForce222(value: boolean): void {
  setBoolToLS("squadForce222", value);
}

export function saveSquadSize(size: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("squadSize", String(size));
}
