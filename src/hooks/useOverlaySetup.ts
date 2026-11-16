"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { useDesign } from "@/context/DesignContext";
import { type Design, isDesign } from "@/lib/design";
import {
  getBoolFromLS,
  getJsonFromLS,
  setBoolToLS,
  setJsonToLS,
} from "@/lib/localStorage";
import {
  DEFAULT_OVERLAY_SIZE,
  OverlaySize,
  companionUrl,
  isOverlaySize,
} from "@/lib/overlay";
import { rollRequestUrl } from "@/lib/rooms/client";
import {
  controlKeyFor,
  generateRoomSecret,
  isRoomSecret,
  viewIdFor,
} from "@/lib/rooms/protocol";

/** Remembers the streamer's card size between visits; filters are the picker's. */
const SIZE_STORAGE_KEY = "overlaySize";
/** The card design the streamer picked here, when they picked one. */
const CARD_DESIGN_STORAGE_KEY = "overlayCardDesign";
/** Whether the streamer keeps perks off the overlay's card. */
const HIDE_PERKS_STORAGE_KEY = "overlayHidePerks";
/** Whether the overlay link includes the companion room. */
const COMPANION_STORAGE_KEY = "overlayCompanion";
/**
 * The companion room's publish secret. Kept between visits so the streamer's
 * OBS link and phone link stay valid when they come back to copy a new
 * overlay link with different filters.
 */
const ROOM_SECRET_STORAGE_KEY = "overlayRoomSecret";

/**
 * Browser source dimensions that always fit the card at each size, with some
 * headroom: its widest (perks wrap at 30 units) and tallest (long perks
 * wrapping to three lines) plus the 16px margin. Measured over many rolls of
 * every hero; a unit is 8px times the size's scale, see OverlayContent.module.css.
 */
export const SOURCE_SIZES: Record<
  OverlaySize,
  { width: number; height: number }
> = {
  small: { width: 220, height: 110 },
  medium: { width: 280, height: 140 },
  large: { width: 400, height: 180 },
  xl: { width: 520, height: 240 },
};

/** What each card design is called in the setup panel. */
export const DESIGN_LABELS: Record<Design, string> = {
  classic: "Classic",
  refresh: "New",
};

/**
 * The ways to roll a new hero while the game has the keyboard, the default
 * first:
 * - `companion`: a click on another screen or device, on the companion
 *   page's button or in OBS itself. Nothing to set up in OBS.
 * - `refresh`: one OBS hotkey that reloads the browser source.
 * - `toggle`: one OBS hotkey on both Show and Hide, pressed twice per hero.
 * - `link`: a link a Stream Deck or a script requests.
 */
export const ROLL_METHODS = [
  { id: "companion", label: "A button on a second screen or device" },
  { id: "refresh", label: "An OBS hotkey" },
  { id: "toggle", label: "An OBS hotkey that hides and shows the card" },
  { id: "link", label: "A Stream Deck button or a script" },
] as const;

export type RollMethod = (typeof ROLL_METHODS)[number]["id"];

export const DEFAULT_ROLL_METHOD: RollMethod = ROLL_METHODS[0].id;

export function isRollMethod(value: unknown): value is RollMethod {
  return ROLL_METHODS.some((method) => method.id === value);
}

/**
 * A link with everything after its "?" replaced by dots. The address of the
 * site is no secret, and seeing it tells the streamer which link this is.
 */
export function maskLink(link: string): string {
  const query = link.indexOf("?");
  return query === -1 ? link : `${link.slice(0, query + 1)}${"•".repeat(20)}`;
}

/**
 * Props for a read-only field holding a link that may be hidden. A streamer
 * may have the setup on stream, and the companion and roll links let anyone
 * roll their hero. Hidden or not, copying gives the real link.
 */
export function secretFieldProps(value: string, shown: boolean, label: string) {
  return {
    type: "text",
    readOnly: true,
    value: shown ? value : maskLink(value),
    "aria-label": shown ? label : `${label}, hidden`,
    onFocus: (e: React.FocusEvent<HTMLInputElement>) =>
      e.currentTarget.select(),
    onCopy: (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.clipboardData.setData("text/plain", value);
      e.preventDefault();
    },
  } as const;
}

export type CopyMethod = "clipboard" | "fallback";

/**
 * Copies text, falling back to selecting it in its input when the clipboard
 * API is unavailable (it needs a secure context and permission).
 */
export function useCopy(onCopied: (method: CopyMethod) => void) {
  const [copied, setCopied] = useState(false);
  // True once the clipboard has refused: the link is selected instead, and
  // the visitor has to press the copy keys themselves.
  const [manual, setManual] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setManual(false);
        onCopied("clipboard");
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1800);
      } catch {
        inputRef.current?.select();
        setManual(true);
        onCopied("fallback");
      }
    },
    [onCopied],
  );

  return { copied, manual, copy, inputRef };
}

interface OverlaySetupOptions {
  /** Built on every render so the link always matches the current filters. */
  buildUrl: (
    size: OverlaySize,
    room: string | null,
    design: Design,
    hidePerks: boolean,
  ) => string;
  /** How many heroes the link's filters select, for analytics. */
  heroCount: number;
  /** Links are only built while the setup is on screen. */
  open: boolean;
  /**
   * Whether the companion is on for a streamer who has never chosen. Once
   * they choose, their choice is what counts.
   */
  companionByDefault?: boolean;
}

/**
 * Everything the stream overlay's setup needs to know and remember: the card
 * size and design, whether the companion is on, its room, and the links those
 * add up to. Both designs' setup panels are views of this.
 */
export function useOverlaySetup({
  buildUrl,
  heroCount,
  open,
  companionByDefault = false,
}: OverlaySetupOptions) {
  const { design: siteDesign } = useDesign();
  // The card follows the design the streamer is looking at, unless they pick
  // the other one here. OBS cannot read their saved choice, so the link has
  // to carry it. A pick is remembered like the size is, so it survives a
  // switch of the site's design (which swaps this setup for the other one)
  // as well as a later visit.
  const [designOverride, setDesignOverride] = useState<Design | null>(null);
  const cardDesign = designOverride ?? siteDesign;
  const [size, setSize] = useState<OverlaySize>(DEFAULT_OVERLAY_SIZE);
  const [hidePerks, setHidePerks] = useState(false);
  // Not remembered: it only picks which instructions are on screen.
  const [rollMethod, setRollMethod] = useState<RollMethod>(DEFAULT_ROLL_METHOD);
  const [companionOn, setCompanionOn] = useState(false);
  const [roomSecret, setRoomSecret] = useState<string | null>(null);
  // Remembers which secret the view id and control key were hashed from, so
  // stale ones are never shown for a different secret, or after it is cleared.
  const [derivedView, setDerivedView] = useState<{
    secret: string;
    id: string | null;
    control: string | null;
  } | null>(null);

  const newRoomSecret = useCallback(() => {
    const secret = generateRoomSecret();
    setRoomSecret(secret);
    setJsonToLS(ROOM_SECRET_STORAGE_KEY, secret);
  }, []);

  useEffect(() => {
    const savedSize = getJsonFromLS<string>(SIZE_STORAGE_KEY);
    // oxlint-disable-next-line react-hooks/set-state-in-effect -- saved settings are in localStorage, read after mount
    if (isOverlaySize(savedSize)) setSize(savedSize);
    const savedDesign = getJsonFromLS<string>(CARD_DESIGN_STORAGE_KEY);
    if (isDesign(savedDesign)) setDesignOverride(savedDesign);
    const savedSecret = getJsonFromLS<string>(ROOM_SECRET_STORAGE_KEY);
    if (isRoomSecret(savedSecret)) setRoomSecret(savedSecret);
    setHidePerks(getBoolFromLS(HIDE_PERKS_STORAGE_KEY, false));
    setCompanionOn(getBoolFromLS(COMPANION_STORAGE_KEY, companionByDefault));
  }, [companionByDefault]);

  // A companion that is on without anyone having switched it on (the default)
  // still needs a room. Made when the setup is first opened, so visitors who
  // never open it are not given one. Another tab may have made one since this
  // tab read storage; that room is used rather than replaced, so both tabs
  // hand out the same links.
  useEffect(() => {
    if (!open || !companionOn || roomSecret) return;
    const stored = getJsonFromLS<string>(ROOM_SECRET_STORAGE_KEY);
    // oxlint-disable-next-line react-hooks/set-state-in-effect -- the room is created on first open and kept in localStorage
    if (isRoomSecret(stored)) setRoomSecret(stored);
    else newRoomSecret();
  }, [open, companionOn, roomSecret, newRoomSecret]);

  // The companion link carries hashes of the secret, never the secret.
  useEffect(() => {
    if (!roomSecret) return;
    let current = true;
    Promise.all([viewIdFor(roomSecret), controlKeyFor(roomSecret)]).then(
      ([id, control]) =>
        current && setDerivedView({ secret: roomSecret, id, control }),
      () =>
        current &&
        setDerivedView({ secret: roomSecret, id: null, control: null }),
    );
    return () => {
      current = false;
    };
  }, [roomSecret]);

  const room = companionOn ? roomSecret : null;
  const url = open ? buildUrl(size, room, cardDesign, hidePerks) : "";
  // The preview never joins the companion room: it rolls its own hero, which
  // would otherwise replace the one OBS is showing on the streamer's phone.
  const previewUrl = open ? buildUrl(size, null, cardDesign, hidePerks) : "";
  const derived =
    roomSecret && derivedView?.secret === roomSecret ? derivedView : null;
  const viewId = derived?.id ?? null;
  const control = derived?.control ?? null;
  const companionLink =
    companionOn && viewId ? companionUrl(viewId, cardDesign, control) : "";
  // For a Stream Deck or macro: requesting it rolls, with no page to open.
  const rollLink =
    companionOn && viewId && control ? rollRequestUrl(viewId, control) : "";

  const overlayCopy = useCopy(
    useCallback(
      (method: CopyMethod) =>
        track("overlay_link_copied", {
          method,
          hero_count: heroCount,
          size,
          companion: room !== null,
          card_design: cardDesign,
          perks_hidden: hidePerks,
        }),
      [heroCount, size, room, cardDesign, hidePerks],
    ),
  );
  const companionCopy = useCopy(
    useCallback(
      (method: CopyMethod) => track("companion_link_copied", { method }),
      [],
    ),
  );

  const rollCopy = useCopy(
    useCallback(
      (method: CopyMethod) => track("roll_link_copied", { method }),
      [],
    ),
  );

  const handleHidePerks = useCallback((hidden: boolean) => {
    setHidePerks(hidden);
    setBoolToLS(HIDE_PERKS_STORAGE_KEY, hidden);
    track("overlay_perks_toggled", { hidden });
  }, []);

  const handleRollMethod = useCallback((method: RollMethod) => {
    setRollMethod(method);
    track("overlay_roll_method_viewed", { method });
  }, []);

  const handleSize = useCallback((value: string) => {
    if (!isOverlaySize(value)) return;
    setSize(value);
    setJsonToLS(SIZE_STORAGE_KEY, value);
  }, []);

  const handleCompanion = useCallback((enabled: boolean) => {
    // A room for a companion switched on here comes from the effect above.
    setCompanionOn(enabled);
    setBoolToLS(COMPANION_STORAGE_KEY, enabled);
    track("overlay_companion_toggled", { enabled });
  }, []);

  const handleCardDesign = useCallback((design: Design) => {
    setDesignOverride(design);
    setJsonToLS(CARD_DESIGN_STORAGE_KEY, design);
  }, []);

  const handleNewCompanionLink = useCallback(() => {
    newRoomSecret();
    track("companion_link_reset", {});
  }, [newRoomSecret]);

  const trackPreviewOpened = useCallback(
    () =>
      track("overlay_link_opened", {
        hero_count: heroCount,
        size,
        card_design: cardDesign,
      }),
    [heroCount, size, cardDesign],
  );

  return {
    cardDesign,
    setCardDesign: handleCardDesign,
    size,
    handleSize,
    hidePerks,
    handleHidePerks,
    rollMethod,
    handleRollMethod,
    companionOn,
    handleCompanion,
    handleNewCompanionLink,
    url,
    previewUrl,
    companionLink,
    rollLink,
    overlayCopy,
    companionCopy,
    rollCopy,
    trackPreviewOpened,
  };
}
