"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useHeroes } from "@/context/HeroContext";
import { usePresets } from "@/context/PresetContext";
import { shortcutForIndex } from "@/lib/presets/types";
import PresetNameField from "@/components/PresetNameField";
import ui from "./ui.module.css";
import styles from "./PresetMenu.module.css";

/**
 * Presets behind one button. A few percent of visitors use them, so they no
 * longer hold a row of the page open; the button names the applied preset, and
 * the panel applies one, saves the current pool as a new one, or leads to the
 * manage page for everything done once in a preset's life (renaming,
 * reordering, deleting, copying its link).
 */
export default function PresetMenu() {
  const { getSelected } = useHeroes();
  const {
    presets,
    appliedId,
    isDirty,
    isHydrated,
    applyPreset,
    savePreset,
    clearApplied,
  } = usePresets();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Set when the panel should hand focus back to its button as it closes.
  const returnFocus = useRef(false);

  const close = (focusButton: boolean) => {
    returnFocus.current = focusButton;
    setOpen(false);
    setSaving(false);
  };

  // Focus moves once the panel is gone, not while it is closing. Moving it
  // sooner would blur the name field while it is still mounted, and the field
  // saves on blur: a name confirmed with Enter would be saved twice.
  useEffect(() => {
    if (open || !returnFocus.current) return;
    returnFocus.current = false;
    buttonRef.current?.focus();
  }, [open]);

  // A small popover, so it closes the way popovers are expected to.
  useEffect(() => {
    if (!open) return;

    // While a name is being typed, the field has the first say. Clicking away
    // blurs it, and its blur saves the name (and closes the panel) or, for an
    // empty name, cancels. Closing here first would unmount the field before
    // that blur ran, and the name would be lost. Escape likewise belongs to
    // the field: it backs out of naming, not out of the panel.
    function handlePointerDown(event: PointerEvent) {
      if (saving) return;
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || saving) return;
      returnFocus.current = true;
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, saving]);

  if (!isHydrated) return null;

  const applied = presets.find((preset) => preset.id === appliedId) ?? null;
  const selectedCount = getSelected().length;

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`${ui.btn} ${ui.caret}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close(false) : setOpen(true))}
      >
        {applied ? (
          <span className={styles.applied}>
            Preset: {applied.name}
            {isDirty ? ", edited" : ""}
          </span>
        ) : (
          "Presets"
        )}
      </button>

      {open && (
        <div id={panelId} className={styles.panel}>
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
                        close(true);
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
              No presets yet. Save the pool you have now to roll from it again
              later.
            </p>
          )}

          <div className={styles.foot}>
            {saving ? (
              <PresetNameField
                initialValue={`${selectedCount} heroes`}
                label="Name for the new preset"
                onCommit={(name) => {
                  savePreset(name);
                  // Enter leaves focus in the field, which is about to go, so
                  // it returns to the button. A click elsewhere has already
                  // moved focus where the visitor wanted it.
                  close(
                    wrapRef.current?.contains(document.activeElement) ?? false,
                  );
                }}
                onCancel={() => setSaving(false)}
              />
            ) : (
              <button
                type="button"
                className={ui.link}
                onClick={() => setSaving(true)}
              >
                Save this pool as a preset
              </button>
            )}
            {applied && (
              <button
                type="button"
                className={ui.link}
                title="Keep these heroes, but stop following the preset"
                onClick={() => {
                  clearApplied();
                  close(true);
                }}
              >
                Stop following {applied.name}
              </button>
            )}
            <Link className={ui.link} href="/presets" prefetch={false}>
              Manage presets
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
