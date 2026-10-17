"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { track } from "@/lib/analytics";

interface OverlaySetupProps {
  /** Built on every render so the link always matches the current filters. */
  buildUrl: () => string;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const url = open ? buildUrl() : "";

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
      });
    }
  }, [url, heroCount]);

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
          </div>

          <ol className="overlay-setup-steps">
            <li>
              In OBS, add a <strong>Browser</strong> source and paste the link
              as its URL. A size of 600 × 300 fits the card; place it anywhere
              on your scene.
            </li>
            <li>
              Open <strong>Settings → Hotkeys</strong>, find{" "}
              <strong>Show</strong> and <strong>Hide</strong> for that source
              under your scene, and give both the <em>same</em> key.
            </li>
            <li>
              Press the key once to hide the overlay — a new hero is rolled
              while it is hidden — and again to reveal it.
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
