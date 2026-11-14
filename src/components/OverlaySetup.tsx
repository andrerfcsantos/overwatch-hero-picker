"use client";

import { useCallback, useId, useState } from "react";
import { track } from "@/lib/analytics";
import { DESIGNS, type Design, isDesign } from "@/lib/design";
import { OVERLAY_SIZES, OverlaySize } from "@/lib/overlay";
import {
  DESIGN_LABELS,
  SOURCE_SIZES,
  useOverlaySetup,
} from "@/hooks/useOverlaySetup";
import QrCode from "./QrCode";

interface OverlaySetupProps {
  /** Built on every render so the link always matches the current filters. */
  buildUrl: (size: OverlaySize, room: string | null, design: Design) => string;
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
  const panelId = useId();
  const {
    cardDesign,
    setCardDesign,
    size,
    handleSize,
    companionOn,
    handleCompanion,
    handleNewCompanionLink,
    url,
    previewUrl,
    companionLink,
    overlayCopy: {
      copied: overlayCopied,
      copy: copyOverlay,
      inputRef: overlayInputRef,
    },
    companionCopy: {
      copied: companionCopied,
      copy: copyCompanion,
      inputRef: companionInputRef,
    },
    trackPreviewOpened,
  } = useOverlaySetup({ buildUrl, heroCount, open });

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
        Stream overlay{open ? " ▾" : " ▸"}
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
            <label htmlFor={`${panelId}-design`}>Card design</label>
            <select
              id={`${panelId}-design`}
              value={cardDesign}
              onChange={(e) => {
                if (isDesign(e.target.value)) setCardDesign(e.target.value);
              }}
            >
              {DESIGNS.map((option) => (
                <option key={option} value={option}>
                  {DESIGN_LABELS[option]}
                </option>
              ))}
            </select>
          </div>

          <div className="overlay-setup-link">
            <input
              ref={overlayInputRef}
              type="text"
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Overlay link"
            />
            <button
              className="action-button btn-share"
              onClick={() => copyOverlay(url)}
            >
              {overlayCopied ? "Copied!" : "Copy link"}
            </button>
            <a
              className="action-button"
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Preview the overlay in a new tab"
              onClick={trackPreviewOpened}
            >
              Open in new tab
            </a>
          </div>

          <ol className="overlay-setup-steps">
            <li>
              In OBS, add a <strong>Browser</strong> source and paste the link
              as its URL. A source of {SOURCE_SIZES[size].width} ×{" "}
              {SOURCE_SIZES[size].height} fits the card at this size; place it
              anywhere on your scene.
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
                      ref={companionInputRef}
                      type="text"
                      readOnly
                      value={companionLink}
                      onFocus={(e) => e.currentTarget.select()}
                      aria-label="Companion link"
                    />
                    <button
                      className="action-button btn-share"
                      onClick={() => copyCompanion(companionLink)}
                      disabled={!companionLink}
                    >
                      {companionCopied ? "Copied!" : "Copy link"}
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
