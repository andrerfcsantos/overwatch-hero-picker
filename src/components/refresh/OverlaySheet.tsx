"use client";

import { useEffect, useId, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { DESIGNS, type Design } from "@/lib/design";
import { OVERLAY_SIZES, OverlaySize } from "@/lib/overlay";
import {
  DESIGN_LABELS,
  ROLL_METHODS,
  SOURCE_SIZES,
  isRollMethod,
  maskLink,
  useOverlaySetup,
} from "@/hooks/useOverlaySetup";
import { Hero } from "@/types/hero";
import OverlayCard from "@/components/OverlayCard";
import QrCode from "@/components/QrCode";
import overlay from "@/components/OverlayContent.module.css";
import sheet from "./Sheet.module.css";
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
  buildUrl: (
    size: OverlaySize,
    room: string | null,
    design: Design,
    hidePerks: boolean,
  ) => string;
  /** How many heroes are in the pool; none means every hero. */
  heroCount: number;
  totalHeroes: number;
  preview: OverlayPreview;
}

type Secret = "overlay_link" | "companion_link" | "companion_qr" | "roll_link";

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
 * stream, and each link lets a viewer watch, post or ask for their rolls. Hidden or
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
 * decide how they will see their own roll, put the link into OBS, then choose
 * how they will ask for a new hero.
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

  // Perks reach the card only when they are rolled at all and not hidden here.
  const cardPerks = preview.showPerks && !hidePerks;

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
        className={`${ui.page} ${sheet.sheet} ph-no-capture`}
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
          <div className={sheet.body}>
            <header className={sheet.head}>
              <h2 id={titleId} className={sheet.title}>
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
            <p className={sheet.intro}>
              A card on your stream that shows a new random hero each time you
              press a hotkey in OBS, or a button on another screen.
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
                            perks={cardPerks ? preview.perks : null}
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

                {/* Nothing to hide when the roll settings have perks off. */}
                {preview.showPerks && (
                  <label className={`${ui.option} ${styles.option}`}>
                    <input
                      type="checkbox"
                      className={ui.check}
                      checked={hidePerks}
                      onChange={(e) => handleHidePerks(e.target.checked)}
                    />
                    <span>
                      Hide perks on the card
                      <small>
                        For when you are not playing the random perks.
                      </small>
                    </span>
                  </label>
                )}

                <p className={styles.fine}>
                  It rolls from {poolPhrase}
                  {cardPerks ? ", with perks" : ""}
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
                        happens, and has a button that rolls a new hero.
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
                      Anyone with this link can watch your rolls and roll a new
                      hero, but cannot choose it. If it gets out,{" "}
                      <button
                        type="button"
                        className={styles.inlineLink}
                        onClick={handleNewCompanionLink}
                      >
                        make a new link
                      </button>
                      , then copy every link again.
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
                  The links stay hidden in case this page is on your stream.
                  Copying works while they are hidden.
                  {companionOn ? " This one includes your companion." : ""}
                </p>
              </li>

              <li className={styles.step}>
                <h3 className={styles.stepTitle}>
                  Choose how you roll a new hero
                </h3>
                <p className={styles.text}>
                  The game has your keyboard while you play, so the card cannot
                  hear a key press on its own.
                </p>

                <div className={styles.field}>
                  <label
                    className={styles.selectLabel}
                    htmlFor={`${groupId}-method`}
                  >
                    Pick a way to roll a new hero
                  </label>
                  <select
                    id={`${groupId}-method`}
                    className={styles.select}
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

                <div className={styles.method}>
                  {rollMethod === "refresh" && (
                    <>
                      <p className={styles.text}>
                        In OBS, open <strong>Settings, Hotkeys</strong>, scroll
                        to the browser source&apos;s own name and give{" "}
                        <strong>Refresh cache of current page</strong> a key.
                      </p>
                      <p className={styles.text}>
                        OBS hears the key while you are in the game. Each press
                        loads the card again with a new hero.
                      </p>
                    </>
                  )}

                  {rollMethod === "toggle" && (
                    <>
                      <p className={styles.text}>
                        For a card that is hidden between rolls. In the
                        source&apos;s properties in OBS, tick{" "}
                        <strong>Shutdown source when not visible</strong>.
                        Without it, the previous hero shows for a moment before
                        each new one.
                      </p>
                      <p className={styles.text}>
                        In OBS, open <strong>Settings, Hotkeys</strong>, find
                        Show and Hide for the source under your scene and give
                        both the same key. Press it once to hide the card, and
                        again to bring it back with a new hero. Switching to
                        another scene and back rolls one too.
                      </p>
                    </>
                  )}

                  {rollMethod === "companion" && (
                    <>
                      {companionOn ? (
                        <p className={styles.text}>
                          Open the companion page from step 2 on a second
                          screen, a phone or a tablet, and press{" "}
                          <strong>New hero</strong>. There are no hotkeys to set
                          up; the card only has to be showing in OBS.
                        </p>
                      ) : (
                        <p className={styles.text}>
                          The companion page has a <strong>New hero</strong>{" "}
                          button. To use it, choose{" "}
                          <strong>On my phone or another screen</strong> in step
                          2, then copy the overlay link into OBS again.
                        </p>
                      )}
                      <p className={styles.text}>
                        With OBS itself on a second screen, you can also select
                        the browser source and click <strong>Refresh</strong> in
                        the toolbar under the preview.
                      </p>
                      <p className={styles.fine}>
                        To show the card in more than one scene, add this same
                        source to each with <strong>Add Existing</strong> rather
                        than a copy: the button rolls one overlay.
                      </p>
                    </>
                  )}

                  {rollMethod === "link" &&
                    (companionOn ? (
                      <>
                        <p className={styles.text}>
                          Have a Stream Deck button, or a script, request this
                          link in the background. Each request rolls a new hero
                          while the card is showing in OBS, in one browser
                          source (add it to more scenes with{" "}
                          <strong>Add Existing</strong>). Keep it out of chats:
                          a chat previewing the link rolls too.
                        </p>
                        <SecretLink
                          label="Roll link"
                          value={rollLink}
                          secret="roll_link"
                          copied={rollCopy.copied}
                          manual={rollCopy.manual}
                          onCopy={rollCopy.copy}
                          inputRef={rollCopy.inputRef}
                        />
                      </>
                    ) : (
                      <p className={styles.text}>
                        The roll link reaches the card through the companion. In
                        step 2, choose{" "}
                        <strong>On my phone or another screen</strong>, then
                        copy the overlay link into OBS again.
                      </p>
                    ))}
                </div>
              </li>
            </ol>
          </div>
        )}
      </dialog>
    </>
  );
}
