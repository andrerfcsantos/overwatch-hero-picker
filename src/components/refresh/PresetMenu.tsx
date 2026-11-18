"use client";

import { type RefObject, useEffect, useId, useRef, useState } from "react";
import { useHeroes } from "@/context/HeroContext";
import { usePresets } from "@/context/PresetContext";
import { clearPanel, readPanel, writePanel } from "@/lib/panels";
import { presetChanges } from "@/lib/presets/changes";
import { shortcutForIndex } from "@/lib/presets/types";
import SpriteIcon from "@/components/SpriteIcon";
import PresetSheet from "./PresetSheet";
import TipButton from "./TipButton";
import ui from "./ui.module.css";
import styles from "./PresetMenu.module.css";

interface PresetMenuProps {
  /**
   * The button that opens the list. Focus comes back to it whenever the
   * control that had it goes away: after saving, reverting or stopping.
   */
  buttonRef: RefObject<HTMLButtonElement | null>;
  /** Says what an action did, for anyone who cannot see it happen. */
  announce: (message: string) => void;
}

/**
 * Which preset the selection comes from, and everything done to it from the
 * picker.
 *
 * Without one it is a plain "Presets" button. With one it names it and
 * carries an × to stop using it. Once the selection has changed it gains a
 * dot, and a save and a revert button after the ×: the whole of what a
 * changed selection costs the page is those three marks, in a row that was
 * already there, and none of them moves the name. What exactly changed is
 * one click away, at the top of the list the name opens.
 */
export default function PresetMenu({ buttonRef, announce }: PresetMenuProps) {
  const { heroes, getSelected } = useHeroes();
  const {
    presets,
    appliedId,
    isDirty,
    isHydrated,
    applyPreset,
    updatePreset,
    revert,
    clearApplied,
  } = usePresets();
  const [open, setOpen] = useState(false);
  const [managing, setManaging] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // A link that names the manager opens it, so a copied address brings
  // whoever follows it to the same place.
  useEffect(() => {
    // oxlint-disable-next-line react-hooks/set-state-in-effect -- the URL is only read after mount
    if (readPanel(window.location.search) === "presets") setManaging(true);
  }, []);

  // A small popover, so it closes the way popovers are expected to.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, buttonRef]);

  if (!isHydrated) return null;

  const applied = presets.find((preset) => preset.id === appliedId) ?? null;
  const changed = applied !== null && isDirty;
  const changes = changed
    ? presetChanges(
        applied.heroes,
        getSelected().map((hero) => hero.key),
      )
    : null;

  // The buttons that act go away with what they did, so focus lands on the
  // name, which now shows the result.
  const settle = (message: string) => {
    setOpen(false);
    announce(message);
    buttonRef.current?.focus();
  };

  const save = () => {
    if (!applied) return;
    updatePreset(applied.id);
    settle(`Saved changes to ${applied.name}.`);
  };

  const undo = () => {
    if (!applied) return;
    revert();
    settle(`Reverted to ${applied.name}.`);
  };

  const heroList = (keys: string[], label: string, removed = false) =>
    keys.length > 0 && (
      <div className={styles.changeRow}>
        <dt>{label}</dt>
        <dd>
          <ul className={styles.changeHeroes}>
            {keys.map((key) => (
              <li
                key={key}
                className={`${styles.changeHero} ${removed ? styles.removed : ""}`}
              >
                <SpriteIcon
                  heroKey={key}
                  type="icon"
                  alt=""
                  className={styles.changeIcon}
                />
                {heroes.find((hero) => hero.key === key)?.name ?? key}
              </li>
            ))}
          </ul>
        </dd>
      </div>
    );

  return (
    <div className={styles.wrap} ref={wrapRef}>
      {/* Grows only to the right, so the name never moves out from under
          the pointer: its dot has a place kept for it, the × sits right
          beside it, and the save and revert buttons arrive after both. */}
      <div className={styles.bar}>
        <div className={applied ? styles.split : styles.solo}>
          <TipButton
            ref={buttonRef}
            className={`${ui.btn} ${ui.caret} ${styles.trigger}`}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={
              applied
                ? `Preset: ${applied.name}${changed ? ", changed" : ""}`
                : undefined
            }
            tip={
              changed
                ? `Selection differs from ${applied.name}. Open to see how.`
                : null
            }
            onClick={() => setOpen(!open)}
          >
            {applied ? (
              <>
                <span className={styles.label}>Preset</span>
                <span className={styles.name}>{applied.name}</span>
                <span
                  className={`${styles.dot} ${changed ? "" : styles.dotOff}`}
                />
              </>
            ) : (
              "Presets"
            )}
          </TipButton>

          {applied && (
            <TipButton
              className={`${ui.btn} ${styles.icon}`}
              aria-label={`Stop using ${applied.name}`}
              tip={`Stop using ${applied.name}, but keep these heroes`}
              onClick={() => {
                clearApplied();
                settle(`Stopped using ${applied.name}.`);
              }}
            >
              <CloseIcon />
            </TipButton>
          )}
        </div>

        {changed && (
          <div className={`${styles.split} ${styles.pending}`}>
            <TipButton
              className={`${ui.btn} ${styles.icon} ${styles.save}`}
              aria-label={`Save changes to ${applied.name}`}
              tip={`Save these changes to the ${applied.name} preset`}
              onClick={save}
            >
              <SaveIcon />
            </TipButton>
            <TipButton
              className={`${ui.btn} ${styles.icon}`}
              aria-label="Revert changes"
              tip={`Undo your changes and go back to ${applied.name}`}
              onClick={undo}
            >
              <RevertIcon />
            </TipButton>
          </div>
        )}
      </div>

      {open && (
        <div id={panelId} className={styles.panel}>
          {changed && changes && (
            <section
              className={styles.changes}
              aria-labelledby={`${panelId}-changes`}
            >
              <h3 id={`${panelId}-changes`} className={styles.changesTitle}>
                Changed since you applied {applied.name}
              </h3>
              <dl className={styles.changeList}>
                {heroList(changes.added, "Added")}
                {heroList(changes.removed, "Removed", true)}
              </dl>
              <div className={styles.changeActions}>
                <button type="button" className={ui.link} onClick={save}>
                  Save changes to {applied.name}
                </button>
                <button type="button" className={ui.link} onClick={undo}>
                  Revert changes
                </button>
              </div>
            </section>
          )}

          {presets.length > 0 ? (
            <ul className={styles.list}>
              {presets.map((preset, index) => {
                const shortcut = shortcutForIndex(index);
                return (
                  <li key={preset.id}>
                    <button
                      type="button"
                      className={styles.item}
                      aria-pressed={preset.id === appliedId}
                      onClick={() => {
                        applyPreset(preset.id, "chip");
                        setOpen(false);
                        buttonRef.current?.focus();
                      }}
                    >
                      <span className={styles.itemName}>{preset.name}</span>
                      <span className={styles.itemCount}>
                        {preset.heroes.length}{" "}
                        {preset.heroes.length === 1 ? "hero" : "heroes"}
                      </span>
                      {shortcut && (
                        <kbd
                          className={styles.itemKey}
                          title={`Press ${shortcut} to apply`}
                        >
                          {shortcut}
                        </kbd>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.empty}>
              No presets yet. Pick some heroes, then use “Save as a preset” to
              roll from them again later.
            </p>
          )}

          <div className={styles.foot}>
            <button
              type="button"
              className={ui.link}
              aria-haspopup="dialog"
              onClick={() => {
                setOpen(false);
                setManaging(true);
                writePanel("presets");
              }}
            >
              Manage presets
            </button>
          </div>
        </div>
      )}

      <PresetSheet
        open={managing}
        onClose={() => {
          setManaging(false);
          clearPanel("presets");
          // The button that opened the sheet went away with the panel, so
          // focus returns to the one that opens the panel.
          buttonRef.current?.focus();
        }}
      />
    </div>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path
        d="M2.5 3.5a1 1 0 0 1 1-1h7.6l2.4 2.4v7.6a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1z M5 2.5v3h5v-3 M4.75 13.5V9.5h6.5v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RevertIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path
        d="M3 6.5h6.5a3.5 3.5 0 0 1 0 7H6 M5.75 3.25 2.75 6.5l3 3.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        d="M3.5 3.5l9 9m0-9l-9 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
