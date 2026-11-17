"use client";

import { track } from "@/lib/analytics";
import { HeroRole } from "@/types/hero";
import { useHeroes } from "@/context/HeroContext";
import { usePresets } from "@/context/PresetContext";
import type { Design } from "@/lib/design";
import { OverlaySize } from "@/lib/overlay";
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
  const { presets, appliedId, isDirty, updatePreset, revert } = usePresets();

  const total = heroes.length;
  const count = getSelected().length;
  const applied = presets.find((preset) => preset.id === appliedId) ?? null;

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
      <div className={styles.head}>
        <div className={styles.title}>
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
          </div>
        </div>

        <PresetMenu />
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

      {/* Says what happened before offering the two ways out of it. */}
      {applied && isDirty && (
        <div className={styles.dirty} aria-live="polite">
          <span>
            You changed the selection after applying the preset “{applied.name}
            ”.
          </span>
          <span className={styles.dirtyActions}>
            <button
              type="button"
              className={ui.btn}
              title="Save your changes into the applied preset"
              onClick={() => updatePreset(applied.id)}
            >
              Update the preset
            </button>
            <button
              type="button"
              className={ui.btn}
              title="Put the selection back to the applied preset"
              onClick={revert}
            >
              Revert selection
            </button>
          </span>
        </div>
      )}

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
