export function getBoolFromLS(key: string, defaultValue: boolean): boolean {
  if (typeof window === "undefined") return defaultValue;
  const val = localStorage.getItem(key);
  if (val === null) return defaultValue;
  return val === "true";
}

export function setBoolToLS(key: string, value: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, String(value));
}

export function getJsonFromLS<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const item = localStorage.getItem(key);
  if (item === null) return null;
  try {
    return JSON.parse(item) as T;
  } catch {
    return null;
  }
}

export function setJsonToLS(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export interface SlotConfig {
  name: string;
  disabledHeroes: Set<string>;
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
  return n >= 1 && n <= 5 ? n : 5;
}

export function saveSquadSize(size: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("squadSize", String(size));
}
