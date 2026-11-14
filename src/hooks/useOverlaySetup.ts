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
import {
  generateRoomSecret,
  isRoomSecret,
  viewIdFor,
} from "@/lib/rooms/protocol";

/** Remembers the streamer's card size between visits; filters are the picker's. */
const SIZE_STORAGE_KEY = "overlaySize";
/** The card design the streamer picked here, when they picked one. */
const CARD_DESIGN_STORAGE_KEY = "overlayCardDesign";
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
  buildUrl: (size: OverlaySize, room: string | null, design: Design) => string;
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
  const [companionOn, setCompanionOn] = useState(false);
  const [roomSecret, setRoomSecret] = useState<string | null>(null);
  // Remembers which secret the view id was hashed from, so a stale id is
  // never shown for a different secret, or after the secret is cleared.
  const [derivedView, setDerivedView] = useState<{
    secret: string;
    id: string | null;
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

  // The companion link carries the hash of the secret, never the secret.
  useEffect(() => {
    if (!roomSecret) return;
    let current = true;
    viewIdFor(roomSecret).then(
      (id) => current && setDerivedView({ secret: roomSecret, id }),
      () => current && setDerivedView({ secret: roomSecret, id: null }),
    );
    return () => {
      current = false;
    };
  }, [roomSecret]);

  const room = companionOn ? roomSecret : null;
  const url = open ? buildUrl(size, room, cardDesign) : "";
  // The preview never joins the companion room: it rolls its own hero, which
  // would otherwise replace the one OBS is showing on the streamer's phone.
  const previewUrl = open ? buildUrl(size, null, cardDesign) : "";
  const viewId =
    roomSecret && derivedView?.secret === roomSecret ? derivedView.id : null;
  const companionLink =
    companionOn && viewId ? companionUrl(viewId, cardDesign) : "";

  const overlayCopy = useCopy(
    useCallback(
      (method: CopyMethod) =>
        track("overlay_link_copied", {
          method,
          hero_count: heroCount,
          size,
          companion: room !== null,
          card_design: cardDesign,
        }),
      [heroCount, size, room, cardDesign],
    ),
  );
  const companionCopy = useCopy(
    useCallback(
      (method: CopyMethod) => track("companion_link_copied", { method }),
      [],
    ),
  );

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
    companionOn,
    handleCompanion,
    handleNewCompanionLink,
    url,
    previewUrl,
    companionLink,
    overlayCopy,
    companionCopy,
    trackPreviewOpened,
  };
}
