"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import {
  getBoolFromLS,
  getJsonFromLS,
  setBoolToLS,
  setJsonToLS,
} from "@/lib/localStorage";
import {
  DEFAULT_OVERLAY_SIZE,
  OVERLAY_SIZES,
  OverlaySize,
  companionUrl,
  isOverlaySize,
} from "@/lib/overlay";
import {
  generateRoomSecret,
  isRoomSecret,
  viewIdFor,
} from "@/lib/rooms/protocol";
import QrCode from "./QrCode";

/** Remembers the streamer's card size between visits; filters are the picker's. */
const SIZE_STORAGE_KEY = "overlaySize";
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
const SOURCE_SIZES: Record<OverlaySize, string> = {
  small: "220 × 110",
  medium: "280 × 140",
  large: "400 × 180",
  xl: "520 × 240",
};

type CopyMethod = "clipboard" | "fallback";

/**
 * Copies text, falling back to selecting it in its input when the clipboard
 * API is unavailable (it needs a secure context and permission).
 */
function useCopy(onCopied: (method: CopyMethod) => void) {
  const [copied, setCopied] = useState(false);
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
        onCopied("clipboard");
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1800);
      } catch {
        inputRef.current?.select();
        onCopied("fallback");
      }
    },
    [onCopied],
  );

  return { copied, copy, inputRef };
}

interface OverlaySetupProps {
  /** Built on every render so the link always matches the current filters. */
  buildUrl: (size: OverlaySize, room: string | null) => string;
  /** How many heroes the link's filters select, for analytics. */
  heroCount: number;
}

/**
 * The "Stream overlay" button and the panel it opens: the overlay link for the
 * current filters, how to wire it into OBS so a hotkey rolls a new hero, and
 * the optional companion view that shows each new hero on another screen.
 */
export default function OverlaySetup({
  buildUrl,
  heroCount,
}: OverlaySetupProps) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<OverlaySize>(DEFAULT_OVERLAY_SIZE);
  const [companionOn, setCompanionOn] = useState(false);
  const [roomSecret, setRoomSecret] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const panelId = useId();

  useEffect(() => {
    const savedSize = getJsonFromLS<string>(SIZE_STORAGE_KEY);
    if (isOverlaySize(savedSize)) setSize(savedSize);
    const savedSecret = getJsonFromLS<string>(ROOM_SECRET_STORAGE_KEY);
    if (isRoomSecret(savedSecret)) setRoomSecret(savedSecret);
    setCompanionOn(getBoolFromLS(COMPANION_STORAGE_KEY, false));
  }, []);

  // The companion link carries the hash of the secret, never the secret.
  useEffect(() => {
    if (!roomSecret) {
      setViewId(null);
      return;
    }
    let current = true;
    viewIdFor(roomSecret).then(
      (id) => current && setViewId(id),
      () => current && setViewId(null),
    );
    return () => {
      current = false;
    };
  }, [roomSecret]);

  const room = companionOn ? roomSecret : null;
  const url = open ? buildUrl(size, room) : "";
  // The preview never joins the companion room: it rolls its own hero, which
  // would otherwise replace the one OBS is showing on the streamer's phone.
  const previewUrl = open ? buildUrl(size, null) : "";
  const companionLink = companionOn && viewId ? companionUrl(viewId) : "";

  const overlayCopy = useCopy(
    useCallback(
      (method: CopyMethod) =>
        track("overlay_link_copied", {
          method,
          hero_count: heroCount,
          size,
          companion: room !== null,
        }),
      [heroCount, size, room],
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

  const newRoomSecret = useCallback(() => {
    const secret = generateRoomSecret();
    setRoomSecret(secret);
    setJsonToLS(ROOM_SECRET_STORAGE_KEY, secret);
  }, []);

  const handleCompanion = useCallback(
    (enabled: boolean) => {
      setCompanionOn(enabled);
      setBoolToLS(COMPANION_STORAGE_KEY, enabled);
      if (enabled && !roomSecret) newRoomSecret();
      track("overlay_companion_toggled", { enabled });
    },
    [roomSecret, newRoomSecret],
  );

  const handleNewCompanionLink = useCallback(() => {
    newRoomSecret();
    track("companion_link_reset", {});
  }, [newRoomSecret]);

  const toggle = useCallback(() => {
    if (!open) track("overlay_setup_opened", {});
    setOpen(!open);
  }, [open]);

  return (
    <>
      <button
        className="action-button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        title="Show your random hero on stream with OBS"
      >
        Stream overlay {open ? "▾" : "▸"}
      </button>

      {open && (
        // ph-no-capture keeps PostHog autocapture and session replay away
        // from the links and QR code, which carry the companion room keys.
        <div id={panelId} className="overlay-setup ph-no-capture">
          <p className="overlay-setup-intro">
            Show your random hero on stream. The link carries the filters and
            options you have now — copy it again after changing them.
          </p>

          <div className="overlay-setup-size">
            <label htmlFor={`${panelId}-size`}>Card size</label>
            <select
              id={`${panelId}-size`}
              value={size}
              onChange={(e) => handleSize(e.target.value)}
            >
              {OVERLAY_SIZES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="overlay-setup-link">
            <input
              ref={overlayCopy.inputRef}
              type="text"
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Overlay link"
            />
            <button
              className="action-button btn-share"
              onClick={() => overlayCopy.copy(url)}
            >
              {overlayCopy.copied ? "Copied!" : "Copy link"}
            </button>
            <a
              className="action-button"
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Preview the overlay in a new tab"
              onClick={() =>
                track("overlay_link_opened", { hero_count: heroCount, size })
              }
            >
              Open in new tab
            </a>
          </div>

          <ol className="overlay-setup-steps">
            <li>
              In OBS, add a <strong>Browser</strong> source and paste the link
              as its URL. A source of {SOURCE_SIZES[size]} fits the card at this
              size; place it anywhere on your scene.
            </li>
            <li>
              In the same source&apos;s properties, tick{" "}
              <strong>Shutdown source when not visible</strong>. Without it, the
              previous hero flashes for a moment when the overlay reappears.
            </li>
            <li>
              Open <strong>Settings → Hotkeys</strong>, find{" "}
              <strong>Show</strong> and <strong>Hide</strong> for that source
              under your scene, and give both the <em>same</em> key.
            </li>
            <li>
              Press the key once to hide the overlay, and again to bring it back
              with a new hero.
            </li>
          </ol>

          <p className="overlay-setup-note">
            Switching to another scene and back also rolls a new hero.
          </p>

          <div className="overlay-companion">
            <label className="overlay-companion-toggle">
              <input
                type="checkbox"
                checked={companionOn}
                onChange={(e) => handleCompanion(e.target.checked)}
              />
              <span>
                <strong>Companion view</strong> — see each new hero on your
                phone or a second screen while you play.
              </span>
            </label>

            {companionOn && (
              <div className="overlay-companion-body">
                {companionLink ? (
                  <QrCode
                    value={companionLink}
                    label="QR code that opens the companion view"
                    className="overlay-companion-qr"
                  />
                ) : (
                  <div className="overlay-companion-qr" aria-hidden="true" />
                )}
                <div className="overlay-companion-details">
                  <p>
                    Scan the code with your phone, or open the link on a second
                    screen. Then copy the overlay link above into OBS again: it
                    now includes the companion.
                  </p>
                  <div className="overlay-setup-link">
                    <input
                      ref={companionCopy.inputRef}
                      type="text"
                      readOnly
                      value={companionLink}
                      onFocus={(e) => e.currentTarget.select()}
                      aria-label="Companion link"
                    />
                    <button
                      className="action-button btn-share"
                      onClick={() => companionCopy.copy(companionLink)}
                      disabled={!companionLink}
                    >
                      {companionCopy.copied ? "Copied!" : "Copy link"}
                    </button>
                    <a
                      className="action-button"
                      href={companionLink || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open the companion view in a new tab"
                      onClick={() => track("companion_link_opened", {})}
                    >
                      Open in new tab
                    </a>
                  </div>
                  <p className="overlay-setup-note">
                    Anyone with this link sees your rolls but cannot change
                    them.{" "}
                    <button
                      type="button"
                      className="overlay-companion-reset"
                      onClick={handleNewCompanionLink}
                    >
                      Make a new link
                    </button>{" "}
                    if it gets out — then copy both links again.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
