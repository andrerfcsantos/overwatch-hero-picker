import { ShareErrorReason } from "@/lib/share/binary";
import { encodeShare, tryDecodeShare } from "@/lib/share/codec";
import { PickerPreset } from "@/lib/share/types";
import { SHARE_PARAM } from "@/lib/share/urls";

/**
 * The stream overlay is a page streamers add to OBS as a Browser Source. OBS
 * runs it in its own embedded browser, which shares no storage with the
 * streamer's normal browser — so everything the overlay needs travels in its
 * URL instead of being read from localStorage.
 */
export const OVERLAY_PATH = "/overlay";

/** Optional key that rerolls while the overlay page itself has focus. */
export const OVERLAY_KEY_PARAM = "key";

/** Optional card size: a preset name, or a multiple of the default size. */
export const OVERLAY_SIZE_PARAM = "size";

/**
 * Card sizes offered in the setup panel, as multiples of the default card.
 * "Extra large" is the card as it first shipped; the default is half that.
 */
export const OVERLAY_SIZES = [
  { id: "small", label: "Small", scale: 0.75 },
  { id: "medium", label: "Medium", scale: 1 },
  { id: "large", label: "Large", scale: 1.5 },
  { id: "xl", label: "Extra large", scale: 2 },
] as const;

export type OverlaySize = (typeof OVERLAY_SIZES)[number]["id"];

export const DEFAULT_OVERLAY_SIZE: OverlaySize = "medium";

/** Bounds for a numeric `size`, so a typo cannot fill or vanish from the scene. */
export const MIN_OVERLAY_SCALE = 0.25;
export const MAX_OVERLAY_SCALE = 4;

export function isOverlaySize(value: unknown): value is OverlaySize {
  return OVERLAY_SIZES.some((size) => size.id === value);
}

/**
 * The card's scale for a `size` param. Accepts a preset name (`large`) or a
 * multiple of the default (`1.25`), clamped to sane bounds. Anything else, or
 * no value, is the default size.
 */
export function parseOverlayScale(value: string | null | undefined): number {
  if (!value) return 1;
  const trimmed = value.trim().toLowerCase();
  const preset = OVERLAY_SIZES.find((size) => size.id === trimmed);
  if (preset) return preset.scale;
  if (!/^\d*\.?\d+$/.test(trimmed)) return 1;
  const scale = Number(trimmed);
  if (!Number.isFinite(scale) || scale <= 0) return 1;
  return Math.min(MAX_OVERLAY_SCALE, Math.max(MIN_OVERLAY_SCALE, scale));
}

/** What the overlay uses when its URL carries no filters: every hero. */
export const DEFAULT_OVERLAY_PICKER: PickerPreset = {
  selected: [],
  showPortrait: true,
  showPerks: true,
  nonRepeating: false,
};

/**
 * Link to the overlay with the given filters and options. The payload is the
 * same picker-preset blob that "Share these filters" uses, so the codec's
 * versioning and validation cover it too.
 */
export function overlayUrl(
  picker: PickerPreset,
  size: OverlaySize = DEFAULT_OVERLAY_SIZE,
): string {
  const encoded = encodeShare({ kind: "picker-preset", picker });
  // The default size stays out of the link, so it can change in one place.
  const sizeParam =
    size === DEFAULT_OVERLAY_SIZE ? "" : `&${OVERLAY_SIZE_PARAM}=${size}`;
  const path = `${OVERLAY_PATH}?${SHARE_PARAM}=${encoded}${sizeParam}`;
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

/**
 * The overlay is meant to run with OBS's "Shutdown source when not visible"
 * ticked, so every show is a fresh page load. Non-repeating mode therefore
 * has to remember the last hero across loads, not just in memory.
 */
export const LAST_HERO_STORAGE_KEY = "overlayLastHero";

type HeroStorage = Pick<Storage, "getItem" | "setItem">;

function defaultStorage(): HeroStorage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    // Storage can be blocked outright, in which case the getter throws.
    return undefined;
  }
}

/** The hero the overlay showed last, or "" when unknown. Never throws. */
export function readLastOverlayHero(
  storage: HeroStorage | undefined = defaultStorage(),
): string {
  try {
    return storage?.getItem(LAST_HERO_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

/** Best effort: without storage, non-repeating mode only holds within a load. */
export function rememberOverlayHero(
  heroKey: string,
  storage: HeroStorage | undefined = defaultStorage(),
): void {
  try {
    storage?.setItem(LAST_HERO_STORAGE_KEY, heroKey);
  } catch {
    // Quota or privacy settings; nothing useful to do.
  }
}

export interface KeyShortcut {
  /** Lowercased `KeyboardEvent.key`, with " " spelled "space". */
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
}

const MODIFIERS = new Set(["ctrl", "control", "alt", "shift", "meta", "cmd"]);

/**
 * Parses a shortcut such as `F8`, `n` or `ctrl+shift+h`. Returns null for
 * anything that does not name exactly one non-modifier key.
 */
export function parseShortcut(
  value: string | null | undefined,
): KeyShortcut | null {
  if (!value) return null;
  const parts = value
    .toLowerCase()
    .split("+")
    .map((part) => part.trim());
  // "ctrl++" means ctrl and the plus key: splitting leaves two empty parts.
  if (parts.length >= 2 && parts.at(-1) === "" && parts.at(-2) === "") {
    parts.splice(-2, 2, "+");
  }
  if (parts.some((part) => part === "")) return null;

  const keys = parts.filter((part) => !MODIFIERS.has(part));
  if (keys.length !== 1) return null;

  return {
    key: keys[0] === " " ? "space" : keys[0],
    ctrl: parts.includes("ctrl") || parts.includes("control"),
    alt: parts.includes("alt"),
    shift: parts.includes("shift"),
    meta: parts.includes("meta") || parts.includes("cmd"),
  };
}

/**
 * Modifiers must match exactly, so `n` does not also fire on ctrl+n. Shift is
 * the exception for single printable characters: `?` already implies shift on
 * most layouts, and requiring the user to spell it out would be a trap.
 */
export function matchesShortcut(
  event: Pick<
    KeyboardEvent,
    "key" | "ctrlKey" | "altKey" | "shiftKey" | "metaKey"
  >,
  shortcut: KeyShortcut,
): boolean {
  const key = event.key === " " ? "space" : event.key.toLowerCase();
  if (key !== shortcut.key) return false;
  if (event.ctrlKey !== shortcut.ctrl) return false;
  if (event.altKey !== shortcut.alt) return false;
  if (event.metaKey !== shortcut.meta) return false;
  const printable = shortcut.key.length === 1;
  if (!printable && event.shiftKey !== shortcut.shift) return false;
  if (printable && shortcut.shift && !event.shiftKey) return false;
  return true;
}

export type OverlayConfig =
  | {
      ok: true;
      picker: PickerPreset;
      shortcut: KeyShortcut | null;
      /** Multiple of the default card size. */
      scale: number;
    }
  | { ok: false; reason: ShareErrorReason; scale: number };

/**
 * Reads one query parameter without the form-encoding rule that turns "+" into
 * a space. Shortcuts use "+" as their separator, and a streamer typing
 * `?key=ctrl+shift+h` into OBS means exactly that.
 */
function readRawParam(search: string, name: string): string | null {
  for (const pair of search.replace(/^\?/, "").split("&")) {
    const separator = pair.indexOf("=");
    const key = separator === -1 ? pair : pair.slice(0, separator);
    if (key !== name) continue;
    try {
      return decodeURIComponent(
        separator === -1 ? "" : pair.slice(separator + 1),
      );
    } catch {
      return null;
    }
  }
  return null;
}

/** Reads the overlay's filters and optional test key from its query string. */
export function readOverlayConfig(search: string): OverlayConfig {
  const params = new URLSearchParams(search);
  const shortcut = parseShortcut(readRawParam(search, OVERLAY_KEY_PARAM));
  // The error card is sized too, so a broken link looks like the overlay it
  // replaces.
  const scale = parseOverlayScale(params.get(OVERLAY_SIZE_PARAM));
  const raw = params.get(SHARE_PARAM);

  if (!raw) {
    return { ok: true, picker: DEFAULT_OVERLAY_PICKER, shortcut, scale };
  }

  const decoded = tryDecodeShare(raw);
  if (!decoded.ok) return { ok: false, reason: decoded.reason, scale };

  // A result link carries the filters that produced it, which are just as
  // usable here as a preset's.
  const { payload } = decoded;
  if (payload.kind === "picker-preset" || payload.kind === "hero-result") {
    return { ok: true, picker: payload.picker, shortcut, scale };
  }
  return { ok: false, reason: "malformed", scale };
}
