"use client";

import { useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { HeroRole } from "@/types/hero";
import { useHeroes } from "@/context/HeroContext";
import { usePresets } from "@/context/PresetContext";
import type { Design } from "@/lib/design";
import { OverlaySize } from "@/lib/overlay";
import PresetNameField from "@/components/PresetNameField";
import ShareButton from "@/components/ShareButton";
import OverlaySheet, { type OverlayPreview } from "./OverlaySheet";
import PoolEditor from "./PoolEditor";
import PresetMenu from "./PresetMenu";
import ui from "./ui.module.css";
import styles from "./HeroPool.module.css";

interface HeroPoolProps {
  /** The hero showing in the result, marked in the roster. */
  currentHeroKey: string | null;
  buildPresetUrl: () => string;
  buildOverlayUrl: (
    size: OverlaySize,
    room: string | null,
    design: Design,
    hidePerks: boolean,
  ) => string;
  /** The roll on the page, which the overlay's setup previews as a card. */
  overlayPreview: OverlayPreview;
}

/**
 * The picker's hero pool: what is in it, the few things done to it as a whole,
 * and the roster itself.
 */
export default function HeroPool({
  currentHeroKey,
  buildPresetUrl,
  buildOverlayUrl,
  overlayPreview,
}: HeroPoolProps) {
  const {
    heroes,
    getSelected,
    getHeroSelected,
    toggleHero,
    selectByRole,
    unselectByRole,
    selectJustRole,
    selectAll,
    unselectAll,
  } = useHeroes();
  const { presets, appliedId, isDirty, isHydrated, savePreset } = usePresets();
  const presetButton = useRef<HTMLButtonElement>(null);
  const saveLink = useRef<HTMLButtonElement>(null);
  const [naming, setNaming] = useState(false);
  const [announcement, setAnnouncement] = useState({ text: "", n: 0 });

  const total = heroes.length;
  const count = getSelected().length;
  const applied = presets.find((preset) => preset.id === appliedId) ?? null;
  const announce = (text: string) =>
    setAnnouncement((last) => ({ text, n: last.n + 1 }));

  // Saving a copy of a preset the selection still matches would only make a
  // twin, so the offer is there without a preset, or once the selection has
  // moved away from it, when it saves those changes as a preset of their own.
  const canSaveNew = isHydrated && (!applied || isDirty);

  const nameField = (
    <PresetNameField
      initialValue={applied ? `${applied.name} copy` : `${count} heroes`}
      label="Name for the new preset"
      onCommit={(name) => {
        const moveFocus = document.activeElement?.tagName === "INPUT";
        savePreset(name);
        setNaming(false);
        announce(`Saved as ${name.trim()}.`);
        // Enter leaves focus in the field, which is about to go. A click
        // elsewhere has already put focus where the visitor wanted it.
        if (moveFocus) presetButton.current?.focus();
      }}
      onCancel={() => {
        setNaming(false);
        // Back to the link that opened the field, once it is back.
        requestAnimationFrame(() => saveLink.current?.focus());
      }}
    />
  );

  const saveNew = naming ? (
    nameField
  ) : (
    <button
      ref={saveLink}
      type="button"
      className={ui.link}
      onClick={() => setNaming(true)}
    >
      Save as a preset
    </button>
  );

  const summary =
    count === 0
      ? "No heroes are selected, so rolls use every hero."
      : count === total
        ? `All ${total} heroes are selected.`
        : `${count} of ${total} heroes are selected.`;

  const setRole = (role: HeroRole, inPool: boolean) => {
    if (inPool) selectByRole(role);
    else unselectByRole(role);
    track("hero_filters_changed", {
      action: inPool ? "select_role" : "unselect_role",
      role,
    });
  };

  const onlyRole = (role: HeroRole) => {
    selectJustRole(role);
    track("hero_filters_changed", { action: "select_only_role", role });
  };

  return (
    <section className={styles.pool} aria-labelledby="hero-pool-heading">
      {/* The summary has a row of its own, so nothing the buttons do (a
          preset gaining its save and revert buttons, a link copied) can push
          it onto a second line and the roster down with it. */}
      <div className={styles.head}>
        <h2 id="hero-pool-heading" className={styles.heading}>
          Hero selection
        </h2>
        <div className={styles.summary}>
          {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a live count, not the result of a form */}
          <span role="status">{summary}</span>
          {count < total && (
            <button
              type="button"
              className={ui.link}
              onClick={() => {
                selectAll();
                track("hero_filters_changed", { action: "select_all" });
              }}
            >
              Select all
            </button>
          )}
          {count > 0 && (
            <button
              type="button"
              className={ui.link}
              onClick={() => {
                unselectAll();
                track("hero_filters_changed", { action: "unselect_all" });
              }}
            >
              Clear selection
            </button>
          )}
          {canSaveNew && saveNew}
        </div>

        {/* Next to the heading rather than with the tools at the far edge:
            it names the selection, and it grows to the right when the
            selection changes, into space kept free for it. */}
        <div className={styles.preset}>
          <PresetMenu buttonRef={presetButton} announce={announce} />
        </div>

        <div className={styles.tools}>
          <ShareButton
            className={ui.btn}
            buildUrl={buildPresetUrl}
            shareType="picker_preset"
            shareSource="picker"
            label="Share selection"
            copiedLabel="Selection link copied"
            title="Copy a link that selects these heroes, with these roll settings"
          />
          <OverlaySheet
            buildUrl={buildOverlayUrl}
            heroCount={count}
            totalHeroes={total}
            preview={overlayPreview}
          />
        </div>
      </div>

      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- announces what a preset action did */}
      <p className={ui.vh} role="status">
        <span key={announcement.n}>{announcement.text}</span>
      </p>

      <PoolEditor
        isIn={getHeroSelected}
        onToggleHero={toggleHero}
        onSetRole={setRole}
        onOnlyRole={onlyRole}
        currentHeroKey={currentHeroKey}
      />
    </section>
  );
}
