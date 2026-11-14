"use client";

import { useEffect, useId, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { DESIGNS, type Design } from "@/lib/design";
import { OVERLAY_SIZES, OverlaySize } from "@/lib/overlay";
import {
  DESIGN_LABELS,
  SOURCE_SIZES,
  useOverlaySetup,
} from "@/hooks/useOverlaySetup";
import { Hero } from "@/types/hero";
import OverlayCard from "@/components/OverlayCard";
import QrCode from "@/components/QrCode";
import overlay from "@/components/OverlayContent.module.css";
import ui from "./ui.module.css";
import styles from "./OverlaySheet.module.css";

/** What the card will show, taken from the roll that is on the page now. */
export interface OverlayPreview {
  hero: Hero | null;
  perks: { minor: string; major: string } | null;
  showPortrait: boolean;
  showPerks: boolean;
  nonRepeating: boolean;
}

interface OverlaySheetProps {
  /** Built on every render so the link always matches the current pool. */
  buildUrl: (size: OverlaySize, room: string | null, design: Design) => string;
  /** How many heroes are in the pool; none means every hero. */
  heroCount: number;
  totalHeroes: number;
  preview: OverlayPreview;
}

/**
 * A link with everything after its "?" replaced by dots. The address of the
 * site is no secret, and seeing it tells the streamer which link this is.
 */
function maskLink(link: string): string {
  const query = link.indexOf("?");
  return query === -1 ? link : `${link.slice(0, query + 1)}${"•".repeat(20)}`;
}

type Secret = "overlay_link" | "companion_link" | "companion_qr";

interface SecretLinkProps {
  /** Names the link for assistive technology, such as "Overlay link". */
  label: string;
  value: string;
  secret: Secret;
  /** From `useCopy`, taken apart because one of them is a ref. */
  copied: boolean;
  manual: boolean;
  onCopy: (text: string) => void;
  inputRef: React.Ref<HTMLInputElement>;
  /** Further actions, placed after Copy and Show. */
  children?: React.ReactNode;
}

/**
 * A link that is hidden until asked for. A streamer may have this page on
 * stream, and either link lets a viewer watch or post their rolls. Hidden or
 * not, the Copy button and the copy keys both give the real link.
 */
function SecretLink({
  label,
  value,
  secret,
  copied,
  manual,
  onCopy,
  inputRef,
  children,
}: SecretLinkProps) {
  const [shown, setShown] = useState(false);

  return (
    <div className={styles.secret}>
      <input
        ref={inputRef}
        className={styles.secretInput}
        type="text"
        readOnly
        value={shown ? value : maskLink(value)}
        aria-label={shown ? label : `${label}, hidden`}
        onFocus={(e) => e.currentTarget.select()}
        onCopy={(e) => {
          // The field holds dots while hidden; what is copied is the link.
          e.clipboardData.setData("text/plain", value);
          e.preventDefault();
        }}
      />
      <div className={styles.secretActions}>
        <button
          type="button"
          className={`${ui.btn} ${styles.copy}`}
          onClick={() => onCopy(value)}
          disabled={!value}
        >
          {copied ? "Link copied" : "Copy link"}
        </button>
        <button
          type="button"
          className={ui.btn}
          aria-pressed={shown}
          disabled={!value}
          onClick={() => {
            if (!shown) track("overlay_secret_revealed", { secret });
            setShown(!shown);
          }}
        >
          {shown ? "Hide link" : "Show link"}
        </button>
        {children}
      </div>
      {manual && (
        <p className={styles.fine} role="alert">
          Your browser blocked the copy. The link is selected: press Ctrl+C (⌘C
          on a Mac) to copy it.
        </p>
      )}
    </div>
  );
}

/**
 * The stream overlay's setup, in a sheet at the right edge of the page. It
 * reads top to bottom in the order a streamer does things: pick the card,
 * decide how they will see their own roll, then put the link into OBS.
 */
export default function OverlaySheet({
  buildUrl,
  heroCount,
  totalHeroes,
  preview,
}: OverlaySheetProps) {
  const [open, setOpen] = useState(false);
  const [qrShown, setQrShown] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const groupId = useId();

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
    overlayCopy,
    companionCopy,
    trackPreviewOpened,
    // Almost every streamer needs the companion, so it is on until they say
    // otherwise.
  } = useOverlaySetup({ buildUrl, heroCount, open, companionByDefault: true });

  // The preview is drawn at the card's real size, and scaled down only when
  // the browser source is wider than the sheet has room for.
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);
  useEffect(() => {
    const stage = stageRef.current;
    if (!open || !stage) return;
    const observer = new ResizeObserver(([entry]) =>
      setStageWidth(entry.contentRect.width),
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, [open]);

  const source = SOURCE_SIZES[size];
  const scale = OVERLAY_SIZES.find((option) => option.id === size)?.scale ?? 1;
  const fit = stageWidth > 0 ? Math.min(1, stageWidth / source.width) : 1;

  const everyHero = heroCount === 0 || heroCount === totalHeroes;
  const poolPhrase = everyHero
    ? `all ${totalHeroes} heroes`
    : heroCount === 1
      ? "the one hero in your pool"
      : `the ${heroCount} heroes in your pool`;

  const show = () => {
    track("overlay_setup_opened", {});
    setOpen(true);
    dialogRef.current?.showModal();
  };

  return (
    <>
      <button
        type="button"
        className={ui.btn}
        aria-haspopup="dialog"
        onClick={show}
        title="Show your random hero on stream with OBS"
      >
        Stream overlay
      </button>

      {/* ph-no-capture keeps PostHog autocapture and session replay away from
          the links and QR code, which carry the companion room keys. */}
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- a click on the backdrop closes the sheet; the keyboard has Escape and the Close button */}
      <dialog
        ref={dialogRef}
        className={`${ui.page} ${styles.sheet} ph-no-capture`}
        aria-labelledby={titleId}
        onClose={() => {
          setOpen(false);
          setQrShown(false);
        }}
        onClick={(e) => {
          // Only the backdrop is the dialog itself; everything else is inside.
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        {open && (
          <div className={styles.body}>
            <header className={styles.head}>
              <h2 id={titleId} className={styles.title}>
                Stream overlay
              </h2>
              <button
                type="button"
                className={ui.btn}
                onClick={() => dialogRef.current?.close()}
              >
                Close
              </button>
            </header>
            <p className={styles.intro}>
              A card on your stream that shows a new random hero each time you
              press a hotkey in OBS.
            </p>

            <ol className={styles.steps}>
              <li className={styles.step}>
                <h3 className={styles.stepTitle}>Pick the card</h3>

                <div className={styles.stage}>
                  <div ref={stageRef} className={styles.stageMeasure}>
                    <div
                      className={styles.sourceFrame}
                      style={{
                        width: source.width * fit,
                        height: source.height * fit,
                      }}
                    >
                      <div
                        className={`${overlay.scaled} ${cardDesign === "refresh" ? overlay.refresh : ""} ${styles.source}`}
                        style={
                          {
                            width: source.width,
                            height: source.height,
                            transform: `scale(${fit})`,
                            "--overlay-scale": scale,
                          } as React.CSSProperties
                        }
                      >
                        {preview.hero && (
                          <OverlayCard
                            hero={preview.hero}
                            perks={preview.showPerks ? preview.perks : null}
                            showPortrait={preview.showPortrait}
                            refresh={cardDesign === "refresh"}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <p className={styles.stageNote}>
                    The dashed box is the browser source, {source.width} ×{" "}
                    {source.height}
                    {fit < 1 ? `, shown at ${Math.round(fit * 100)}%` : ""}.
                  </p>
                </div>

                <fieldset className={styles.field}>
                  <legend>Size</legend>
                  <div className={styles.seg}>
                    {OVERLAY_SIZES.map((option) => (
                      <label key={option.id}>
                        <input
                          type="radio"
                          className={ui.vh}
                          name={`${groupId}-size`}
                          checked={option.id === size}
                          onChange={() => handleSize(option.id)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className={styles.field}>
                  <legend>Look</legend>
                  <div className={styles.seg}>
                    {DESIGNS.map((option) => (
                      <label key={option}>
                        <input
                          type="radio"
                          className={ui.vh}
                          name={`${groupId}-look`}
                          checked={option === cardDesign}
                          onChange={() => setCardDesign(option)}
                        />
                        <span>{DESIGN_LABELS[option]}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <p className={styles.fine}>
                  It rolls from {poolPhrase}
                  {preview.showPerks ? ", with perks" : ""}
                  {preview.nonRepeating
                    ? ", and never the same hero twice in a row"
                    : ""}
                  . The link carries the pool and roll settings you have now, so
                  copy it again after you change them.
                </p>
              </li>

              <li className={styles.step}>
                <h3 className={styles.stepTitle}>
                  Choose where you will see the roll
                </h3>

                <div
                  className={`${styles.screens} ${companionOn ? styles.withPhone : ""}`}
                  aria-hidden="true"
                >
                  <figure>
                    <div className={styles.screen} />
                    <figcaption>Your game</figcaption>
                  </figure>
                  <figure>
                    <div className={styles.screen}>
                      <span className={styles.miniCard} />
                    </div>
                    <figcaption>Your stream</figcaption>
                  </figure>
                  <figure>
                    <div className={styles.phone}>
                      <span className={styles.miniCard} />
                    </div>
                    <figcaption>Your phone</figcaption>
                  </figure>
                </div>

                <p className={styles.text}>
                  OBS adds the card to your stream, not to your game. While you
                  play, your viewers know who you rolled before you do, unless
                  you can see OBS on a second monitor.
                </p>

                <fieldset className={styles.choices}>
                  <legend className={ui.vh}>Where you will see the roll</legend>
                  <label className={styles.choice}>
                    <input
                      type="radio"
                      className={ui.check}
                      name={`${groupId}-companion`}
                      checked={companionOn}
                      onChange={() => handleCompanion(true)}
                    />
                    <span className={styles.choiceText}>
                      On my phone or another screen
                      <small>
                        The companion page shows each roll the moment it
                        happens.
                      </small>
                    </span>
                  </label>
                  <label className={styles.choice}>
                    <input
                      type="radio"
                      className={ui.check}
                      name={`${groupId}-companion`}
                      checked={!companionOn}
                      onChange={() => handleCompanion(false)}
                    />
                    <span className={styles.choiceText}>
                      In OBS, on a second monitor
                      <small>Nothing more to set up.</small>
                    </span>
                  </label>
                </fieldset>

                {companionOn && (
                  <div className={styles.companion}>
                    <div className={styles.qr}>
                      {qrShown && companionLink ? (
                        <QrCode
                          value={companionLink}
                          label="QR code that opens the companion page"
                          className={styles.qrCode}
                        />
                      ) : (
                        <span className={styles.qrCover} aria-hidden="true" />
                      )}
                      <button
                        type="button"
                        className={ui.link}
                        aria-pressed={qrShown}
                        disabled={!companionLink}
                        onClick={() => {
                          if (!qrShown) {
                            track("overlay_secret_revealed", {
                              secret: "companion_qr",
                            });
                          }
                          setQrShown(!qrShown);
                        }}
                      >
                        {qrShown ? "Hide the QR code" : "Show the QR code"}
                      </button>
                    </div>
                    <div className={styles.companionLink}>
                      <p className={styles.text}>
                        Scan the code with your phone, or open this link on the
                        other screen, and leave it open while you stream.
                      </p>
                      <SecretLink
                        label="Companion link"
                        value={companionLink}
                        secret="companion_link"
                        copied={companionCopy.copied}
                        manual={companionCopy.manual}
                        onCopy={companionCopy.copy}
                        inputRef={companionCopy.inputRef}
                      >
                        <a
                          className={ui.btn}
                          href={companionLink || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => track("companion_link_opened", {})}
                        >
                          Open
                        </a>
                      </SecretLink>
                    </div>
                    <p className={styles.fine}>
                      Anyone with this link can watch your rolls, but cannot
                      change them. If it gets out,{" "}
                      <button
                        type="button"
                        className={styles.inlineLink}
                        onClick={handleNewCompanionLink}
                      >
                        make a new link
                      </button>
                      , then copy both links again.
                    </p>
                  </div>
                )}
              </li>

              <li className={styles.step}>
                <h3 className={styles.stepTitle}>Paste the link into OBS</h3>
                <p className={styles.text}>
                  Add a <strong>Browser</strong> source and paste this link as
                  its URL.
                </p>
                <SecretLink
                  label="Overlay link"
                  value={url}
                  secret="overlay_link"
                  copied={overlayCopy.copied}
                  manual={overlayCopy.manual}
                  onCopy={overlayCopy.copy}
                  inputRef={overlayCopy.inputRef}
                >
                  <a
                    className={ui.btn}
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open the overlay in a new tab. It rolls its own hero and leaves your companion alone."
                    onClick={trackPreviewOpened}
                  >
                    Try it
                  </a>
                </SecretLink>
                <dl className={styles.dims}>
                  <div>
                    <dt>Width</dt>
                    <dd>{source.width}</dd>
                  </div>
                  <div>
                    <dt>Height</dt>
                    <dd>{source.height}</dd>
                  </div>
                </dl>
                <p className={styles.fine}>
                  Both links stay hidden in case this page is on your stream.
                  Copying works while they are hidden.
                  {companionOn ? " This one includes your companion." : ""}
                </p>
              </li>

              <li className={styles.step}>
                <h3 className={styles.stepTitle}>
                  Tick “Shutdown source when not visible”
                </h3>
                <p className={styles.text}>
                  It is in the same source&apos;s properties. Without it, the
                  previous hero shows for a moment before each new one.
                </p>
              </li>

              <li className={styles.step}>
                <h3 className={styles.stepTitle}>
                  Give Show and Hide the same hotkey
                </h3>
                <p className={styles.text}>
                  In <strong>Settings, Hotkeys</strong>, find Show and Hide for
                  the source under your scene. Press the key once to hide the
                  card, and again to bring it back with a new hero. Switching to
                  another scene and back rolls one too.
                </p>
              </li>
            </ol>
          </div>
        )}
      </dialog>
    </>
  );
}
