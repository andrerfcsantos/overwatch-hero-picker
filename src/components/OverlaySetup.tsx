"use client";

import { useCallback, useId, useState } from "react";
import { track } from "@/lib/analytics";
import { DESIGNS, type Design, isDesign } from "@/lib/design";
import { OVERLAY_SIZES, OverlaySize } from "@/lib/overlay";
import {
  DESIGN_LABELS,
  ROLL_METHODS,
  SOURCE_SIZES,
  isRollMethod,
  secretFieldProps,
  useOverlaySetup,
} from "@/hooks/useOverlaySetup";
import QrCode from "./QrCode";

interface OverlaySetupProps {
  /** Built on every render so the link always matches the current filters. */
  buildUrl: (
    size: OverlaySize,
    room: string | null,
    design: Design,
    hidePerks: boolean,
  ) => string;
  /** How many heroes the link's filters select, for analytics. */
  heroCount: number;
}

/**
 * The "Stream overlay" button and the panel it opens: the overlay link for the
 * current filters, the ways to roll a new hero once it is in OBS, and the
 * optional companion view that shows each new hero on another screen and can
 * roll one too.
 */
export default function OverlaySetup({
  buildUrl,
  heroCount,
}: OverlaySetupProps) {
  const [open, setOpen] = useState(false);
  // The companion's code and links can roll the streamer's hero, so they stay
  // hidden until asked for, in case this page is on stream.
  const [linksShown, setLinksShown] = useState(false);
  const panelId = useId();
  const {
    cardDesign,
    setCardDesign,
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
    rollCopy: { copied: rollCopied, copy: copyRoll, inputRef: rollInputRef },
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
    else setLinksShown(false);
    setOpen(!open);
  }, [open]);

  const showLinksButton = (
    <button
      type="button"
      className="action-button"
      aria-pressed={linksShown}
      disabled={!companionLink}
      onClick={() => {
        if (!linksShown) {
          track("overlay_secret_revealed", { secret: "companion_link" });
        }
        setLinksShown(!linksShown);
      }}
    >
      {linksShown ? "Hide" : "Show"}
    </button>
  );

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

          <label className="overlay-setup-check">
            <input
              type="checkbox"
              checked={hidePerks}
              onChange={(e) => handleHidePerks(e.target.checked)}
            />
            <span>
              <strong>Hide perks on the card</strong> — for when you are not
              playing the random perks. Otherwise the card shows them whenever
              perks are on in your options.
            </span>
          </label>

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

          <div className="overlay-setup-size">
            <label htmlFor={`${panelId}-method`}>Roll a new hero with</label>
            <select
              id={`${panelId}-method`}
              value={rollMethod}
              onChange={(e) => {
                if (isRollMethod(e.target.value)) {
                  handleRollMethod(e.target.value);
                }
              }}
            >
              {ROLL_METHODS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <ol className="overlay-setup-steps">
            <li>
              In OBS, add a <strong>Browser</strong> source and paste the link
              as its URL. A source of {SOURCE_SIZES[size].width} ×{" "}
              {SOURCE_SIZES[size].height} fits the card at this size; place it
              anywhere on your scene.
            </li>

            {rollMethod === "refresh" && (
              <>
                <li>
                  In OBS, open <strong>Settings → Hotkeys</strong> and scroll to
                  the browser source&apos;s own name. Give{" "}
                  <strong>Refresh cache of current page</strong> a key.
                </li>
                <li>
                  Press the key for a new hero. OBS hears it while you are in
                  the game.
                </li>
              </>
            )}

            {rollMethod === "toggle" && (
              <>
                <li>
                  For a card that is hidden between rolls. In the source&apos;s
                  properties in OBS, tick{" "}
                  <strong>Shutdown source when not visible</strong>. Without it,
                  the previous hero flashes for a moment when the overlay
                  reappears.
                </li>
                <li>
                  In OBS, open <strong>Settings → Hotkeys</strong>, find{" "}
                  <strong>Show</strong> and <strong>Hide</strong> for that
                  source under your scene, and give both the <em>same</em> key.
                </li>
                <li>
                  Press the key once to hide the overlay, and again to bring it
                  back with a new hero. Switching to another scene and back also
                  rolls one.
                </li>
              </>
            )}

            {rollMethod === "companion" && (
              <>
                <li>
                  {companionOn ? (
                    <>
                      Open the companion view below on a second screen, a phone
                      or a tablet, and press <strong>New hero</strong>. There
                      are no hotkeys to set up; the overlay only has to be
                      showing in OBS.
                    </>
                  ) : (
                    <>
                      Turn on <strong>Companion view</strong> below, then copy
                      the overlay link above into OBS. The companion shows each
                      hero on a second screen, a phone or a tablet, and has a{" "}
                      <strong>New hero</strong> button.
                    </>
                  )}
                </li>
                <li>
                  With OBS itself on a second screen, you can also select the
                  browser source and click <strong>Refresh</strong> in the
                  toolbar under the preview.
                </li>
                <li>
                  To show the card in more than one scene, add this same source
                  to each with <strong>Add Existing</strong> rather than a copy:
                  the button rolls one overlay.
                </li>
              </>
            )}

            {rollMethod === "link" &&
              (companionOn ? (
                <li>
                  Have a Stream Deck button, or a script, request this link in
                  the background. Each request rolls a new hero while the
                  overlay is showing in OBS, in one browser source (add it to
                  more scenes with <strong>Add Existing</strong>). Keep it out
                  of chats: a chat previewing the link rolls too.
                  <div className="overlay-setup-link">
                    <input
                      ref={rollInputRef}
                      {...secretFieldProps(rollLink, linksShown, "Roll link")}
                    />
                    <button
                      className="action-button btn-share"
                      onClick={() => copyRoll(rollLink)}
                      disabled={!rollLink}
                    >
                      {rollCopied ? "Copied!" : "Copy link"}
                    </button>
                    {showLinksButton}
                  </div>
                </li>
              ) : (
                <li>
                  The roll link reaches the overlay through the companion. Turn
                  on <strong>Companion view</strong> below, then copy the
                  overlay link above into OBS.
                </li>
              ))}
          </ol>

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
                {companionLink && linksShown ? (
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
                      {...secretFieldProps(
                        companionLink,
                        linksShown,
                        "Companion link",
                      )}
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
                    {showLinksButton}
                  </div>
                  <p className="overlay-setup-note">
                    Anyone with this link sees your rolls and can roll a new
                    hero, but cannot choose it. The code and links stay hidden
                    in case this page is on your stream; copying works while
                    they are hidden.{" "}
                    <button
                      type="button"
                      className="overlay-companion-reset"
                      onClick={handleNewCompanionLink}
                    >
                      Make a new link
                    </button>{" "}
                    if it gets out — then copy every link again, including any
                    Stream Deck roll link.
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
