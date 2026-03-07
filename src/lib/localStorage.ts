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
