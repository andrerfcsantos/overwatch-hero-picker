import { afterEach, describe, expect, test, vi } from "vite-plus/test";

import {
  getBoolFromLS,
  getJsonFromLS,
  setBoolToLS,
  setJsonToLS,
} from "./localStorage";

function stubStorage(storage: Pick<Storage, "getItem" | "setItem">) {
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", storage);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("storage helpers", () => {
  // Banners read and write their dismissal through these as they mount and
  // close; a throw there would take the page down with them.
  test("fall back instead of throwing when storage is blocked", () => {
    stubStorage({
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(getBoolFromLS("flag", true)).toBe(true);
    expect(getJsonFromLS("value")).toBeNull();
    expect(() => setBoolToLS("flag", true)).not.toThrow();
    expect(() => setJsonToLS("value", { a: 1 })).not.toThrow();
  });

  test("drop the write when storage is full, without throwing", () => {
    stubStorage({
      getItem: () => null,
      setItem: () => {
        throw new DOMException("full", "QuotaExceededError");
      },
    });
    expect(() => setBoolToLS("flag", true)).not.toThrow();
    expect(getBoolFromLS("flag", false)).toBe(false);
  });

  test("round-trip when storage works", () => {
    const values = new Map<string, string>();
    stubStorage({
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => void values.set(key, value),
    });
    setBoolToLS("flag", true);
    expect(getBoolFromLS("flag", false)).toBe(true);
    setJsonToLS("value", { a: 1 });
    expect(getJsonFromLS("value")).toEqual({ a: 1 });
  });
});
