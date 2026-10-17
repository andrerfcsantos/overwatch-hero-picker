"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { getJsonFromLS, setJsonToLS } from "@/lib/localStorage";
import {
  DEFAULT_OVERLAY_SIZE,
  OVERLAY_SIZES,
  OverlaySize,
  isOverlaySize,
} from "@/lib/overlay";

/** Remembers the streamer's card size between visits; filters are the picker's. */
const SIZE_STORAGE_KEY = "overlaySize";

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

interface OverlaySetupProps {
  /** Built on every render so the link always matches the current filters. */
  buildUrl: (size: OverlaySize) => string;
  /** How many heroes the link's filters select, for analytics. */
  heroCount: number;
}

/**
 * The "Stream overlay" button and the panel it opens: the overlay link for the
 * current filters, and how to wire it into OBS so a hotkey rolls a new hero.
 */
export default function OverlaySetup({
  buildUrl,
  heroCount,
}: OverlaySetupProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [size, setSize] = useState<OverlaySize>(DEFAULT_OVERLAY_SIZE);
  const inputRef = useRef<HTMLInputElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  useEffect(() => {
    const saved = getJsonFromLS<string>(SIZE_STORAGE_KEY);
    if (isOverlaySize(saved)) setSize(saved);
  }, []);

  const url = open ? buildUrl(size) : "";

  const handleSize = useCallback((value: string) => {
    if (!isOverlaySize(value)) return;
    setSize(value);
    setJsonToLS(SIZE_STORAGE_KEY, value);
  }, []);

  const toggle = useCallback(() => {
    if (!open) track("overlay_setup_opened", {});
    setOpen(!open);
  }, [open]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("overlay_link_copied", {
        method: "clipboard",
        hero_count: heroCount,
        size,
      });
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // The clipboard API needs a secure context and permission. The link is
      // already on screen, so select it for a manual copy.
      inputRef.current?.select();
      track("overlay_link_copied", {
        method: "fallback",
        hero_count: heroCount,
        size,
      });
    }
  }, [url, heroCount, size]);

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
        <div id={panelId} className="overlay-setup">
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
              ref={inputRef}
              type="text"
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Overlay link"
            />
            <button className="action-button btn-share" onClick={handleCopy}>
              {copied ? "Copied!" : "Copy link"}
            </button>
            <a
              className="action-button"
              href={url}
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
        </div>
      )}
    </>
  );
}
