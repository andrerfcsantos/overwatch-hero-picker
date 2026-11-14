"use client";

import { ROLES } from "@/data/heroes";
import type { Picker } from "@/hooks/usePicker";
import RoleSpriteIcon from "@/components/RoleSpriteIcon";
import ShareButton from "@/components/ShareButton";
import SharedPresetNotice from "@/components/SharedPresetNotice";
import SpriteIcon from "@/components/SpriteIcon";
import FeedbackBanner from "./FeedbackBanner";
import HeroPool from "./HeroPool";
import ui from "./ui.module.css";
import styles from "./PickerRefresh.module.css";

/**
 * The new design of the random hero page: the roll in a rail that stays put,
 * the hero pool beside it. Its behaviour is `usePicker`, shared with the
 * classic design.
 */
export default function PickerRefresh({ picker }: { picker: Picker }) {
  const {
    selectedHero,
    perkLabels,
    heroCount,
    perksCount,
    lastRoll,
    showPortrait,
    showPerks,
    nonRepeatingMode,
    handleRandomHero,
    handleNewPerks,
    handleShowPortrait,
    handleShowPerks,
    handleNonRepeating,
    buildResultUrl,
    buildPresetUrl,
    buildOverlayUrl,
    sharedPresetApplied,
    handleUndoShared,
    handleDismissShared,
  } = picker;

  const roleLabel = selectedHero
    ? (ROLES.find((role) => role.key === selectedHero.role)?.label ?? "")
    : "";
  const perksShown = showPerks && perkLabels !== null;

  // Read out after a roll the visitor asked for, and says which kind it was.
  // The opening hero is on the page when it loads, so it is not announced as
  // news.
  const perksSpoken = perksShown
    ? `minor perk ${perkLabels.minor}, major perk ${perkLabels.major}`
    : "";
  const announcement = !selectedHero
    ? ""
    : lastRoll === "hero"
      ? `Rolled ${selectedHero.name}, ${roleLabel}.${perksSpoken ? ` With ${perksSpoken}.` : ""}`
      : lastRoll === "perks" && perksSpoken
        ? `New perks for ${selectedHero.name}: ${perksSpoken}.`
        : "";

  return (
    <main className={`${ui.page} ${styles.app}`}>
      <section
        className={`${styles.rail} ${showPortrait ? "" : styles.noPortrait}`}
        aria-labelledby="picker-heading"
      >
        {/* Focusable from script only: it takes focus when the design is
            switched from the invitation, whose own button is removed. */}
        <h1 id="picker-heading" className={styles.lead} tabIndex={-1}>
          You should play
        </h1>

        {selectedHero && (
          <>
            {showPortrait && (
              <div className={styles.portraitFrame}>
                <SpriteIcon
                  key={heroCount}
                  heroKey={selectedHero.key}
                  type="portrait"
                  className={`${styles.portrait} ${ui.land}`}
                  alt={`${selectedHero.name} portrait`}
                />
              </div>
            )}

            <p
              key={`name-${heroCount}`}
              className={`${styles.name} ${ui.land}`}
            >
              {selectedHero.name}
            </p>
            <div className={styles.role}>
              <RoleSpriteIcon
                roleKey={selectedHero.role}
                alt=""
                className={ui.roleIcon}
              />
              {roleLabel}
            </div>

            {perksShown && (
              <dl
                key={`perks-${perksCount}`}
                className={`${ui.perks} ${styles.perks} ${ui.land}`}
              >
                <div>
                  <dt>Minor perk</dt>
                  <dd>{perkLabels.minor}</dd>
                </div>
                <div>
                  <dt>Major perk</dt>
                  <dd>{perkLabels.major}</dd>
                </div>
              </dl>
            )}

            <div className={styles.actions}>
              {perksShown && (
                <button
                  type="button"
                  className={ui.btn}
                  onClick={handleNewPerks}
                >
                  Reroll perks
                </button>
              )}
              <ShareButton
                className={ui.btn}
                buildUrl={buildResultUrl}
                shareType="hero_result"
                shareSource="picker"
                label="Share this roll"
                copiedLabel="Roll link copied"
                title="Copy a link that reveals this hero"
              />
            </div>
          </>
        )}

        <div className={ui.rollBar} data-roll-bar>
          <button type="button" className={ui.roll} onClick={handleRandomHero}>
            Roll a hero
            <kbd className={ui.kbd} aria-hidden="true">
              R
            </kbd>
          </button>
        </div>

        <details className={styles.settings}>
          <summary>Roll settings</summary>
          <label className={ui.option}>
            <input
              type="checkbox"
              className={ui.check}
              checked={showPortrait}
              onChange={(e) => handleShowPortrait(e.target.checked)}
            />
            Show the hero portrait
          </label>
          <label className={ui.option}>
            <input
              type="checkbox"
              className={ui.check}
              checked={showPerks}
              onChange={(e) => handleShowPerks(e.target.checked)}
            />
            Roll perks with the hero
          </label>
          <label className={ui.option}>
            <input
              type="checkbox"
              className={ui.check}
              checked={nonRepeatingMode}
              onChange={(e) => handleNonRepeating(e.target.checked)}
            />
            Never roll the same hero twice in a row
          </label>
        </details>

        {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- announces each roll, not the result of a form */}
        <p className={ui.vh} role="status">
          {/* Keyed by roll: a screen reader stays silent when a live region is
              set to the text it already holds, as rolling the same hero
              twice would. A new node is always news. */}
          <span key={`${heroCount}-${perksCount}`}>{announcement}</span>
        </p>
      </section>

      <div className={styles.side}>
        <div className={styles.feedback}>
          <FeedbackBanner />
        </div>
        {sharedPresetApplied && (
          <div className={styles.notice}>
            <SharedPresetNotice
              message="A shared link set this pool and these roll settings, replacing your own."
              onUndo={handleUndoShared}
              onDismiss={handleDismissShared}
            />
          </div>
        )}
        <HeroPool
          currentHeroKey={selectedHero?.key ?? null}
          buildPresetUrl={buildPresetUrl}
          buildOverlayUrl={buildOverlayUrl}
          overlayPreview={{
            hero: selectedHero,
            perks: perkLabels,
            showPortrait,
            showPerks,
            nonRepeating: nonRepeatingMode,
          }}
        />
      </div>
    </main>
  );
}
