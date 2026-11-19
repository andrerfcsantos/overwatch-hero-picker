import { describe, expect, test } from "vite-plus/test";
import { readPanel } from "./panels";

describe("readPanel", () => {
  test("reads the panels a link can open", () => {
    expect(readPanel("?panel=presets")).toBe("presets");
    expect(readPanel("?panel=overlay")).toBe("overlay");
  });

  test("finds the panel among other parameters", () => {
    expect(readPanel("?d=abc&panel=overlay")).toBe("overlay");
  });

  test("ignores a missing or unknown panel", () => {
    expect(readPanel("")).toBeNull();
    expect(readPanel("?d=abc")).toBeNull();
    expect(readPanel("?panel=")).toBeNull();
    expect(readPanel("?panel=Presets")).toBeNull();
    expect(readPanel("?panel=squad")).toBeNull();
  });
});
