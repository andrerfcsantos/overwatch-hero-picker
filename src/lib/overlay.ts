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
export function overlayUrl(picker: PickerPreset): string {
  const encoded = encodeShare({ kind: "picker-preset", picker });
  const path = `${OVERLAY_PATH}?${SHARE_PARAM}=${encoded}`;
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
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
  | { ok: true; picker: PickerPreset; shortcut: KeyShortcut | null }
  | { ok: false; reason: ShareErrorReason };

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
  const raw = params.get(SHARE_PARAM);

  if (!raw) return { ok: true, picker: DEFAULT_OVERLAY_PICKER, shortcut };

  const decoded = tryDecodeShare(raw);
  if (!decoded.ok) return { ok: false, reason: decoded.reason };

  // A result link carries the filters that produced it, which are just as
  // usable here as a preset's.
  const { payload } = decoded;
  if (payload.kind === "picker-preset" || payload.kind === "hero-result") {
    return { ok: true, picker: payload.picker, shortcut };
  }
  return { ok: false, reason: "malformed" };
}
