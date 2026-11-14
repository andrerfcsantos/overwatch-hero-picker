"use client";

import { useState } from "react";
import { perksFromIndices } from "@/lib/heroService";
import { emptySlotConfig } from "@/lib/squadService";
import type { Squad } from "@/hooks/useSquad";
import ShareButton from "./ShareButton";
import SharedPresetNotice from "./SharedPresetNotice";
import SquadSlot from "./SquadSlot";
import styles from "./SquadContent.module.css";

/** The classic design of the squad generator. Its behaviour is `useSquad`. */
export default function SquadContent({ squad }: { squad: Squad }) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const {
    squadSize,
    configs,
    heroes,
    perkAssignments,
    force122,
    force222,
    randomizePerks,
    copied,
    sharedPresetApplied,
    hasAnyActiveFilters,
    randomizeAll,
    randomizeSingle,
    handleCopy,
    handleSizeChange,
    handleNameChange,
    handleDisabledChange,
    resetSlotFilters,
    resetAllFilters,
    handleForce122Change,
    handleForce222Change,
    handlePerksChange,
    buildResultUrl,
    buildPresetUrl,
    handleUndoShared,
    handleDismissShared,
  } = squad;

  return (
    <div className={styles.container}>
      {sharedPresetApplied && (
        <SharedPresetNotice
          message="A shared squad setup has been applied, replacing your own filters and options."
          onUndo={handleUndoShared}
          onDismiss={handleDismissShared}
        />
      )}

      <h1 className={styles.title}>Build Your Squad</h1>

      <div className="mt-3 mb-1 max-w-1/2">
        <p className="text-gray-400 m-0 mb-2">
          Choose your squad size and hit <strong>Randomize Squad</strong> to get
          a random squad.
          <br />
          You can select the pool of random heroes for each slot and give it a
          name.
          <br />
          <strong>Share squad</strong> sends a link that reveals this squad —
          the heroes stay hidden until it is opened.
        </p>
      </div>

      <div className={styles.sizeSelector}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <button
            key={n}
            className={`${styles.sizeBtn} ${n === squadSize ? styles.sizeBtnActive : ""}`}
            onClick={() => handleSizeChange(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <div className={styles.setupRow}>
        <button
          className={styles.optionsToggle}
          onClick={() => setOptionsOpen(!optionsOpen)}
        >
          ⚙ Options {optionsOpen ? "▾" : "▸"}
        </button>
        {hasAnyActiveFilters && (
          <button className={styles.resetFiltersBtn} onClick={resetAllFilters}>
            Reset All Filters
          </button>
        )}
      </div>

      {optionsOpen && (
        <div className={styles.optionsPanel}>
          <label className={styles.optionLabel}>
            <input
              type="checkbox"
              checked={force122}
              onChange={(e) => handleForce122Change(e.target.checked)}
            />
            Force 1-2-2
            <span
              className="info-icon"
              data-tip="Force 1 Tank, 2 Damage, 2 Support (only when size = 5)"
            >
              ⓘ
            </span>
          </label>
          <label className={styles.optionLabel}>
            <input
              type="checkbox"
              checked={force222}
              onChange={(e) => handleForce222Change(e.target.checked)}
            />
            Force 2-2-2
            <span
              className="info-icon"
              data-tip="Force 2 Tanks, 2 Damage, 2 Support (only when size = 6)"
            >
              ⓘ
            </span>
          </label>
          <label className={styles.optionLabel}>
            <input
              type="checkbox"
              checked={randomizePerks}
              onChange={(e) => handlePerksChange(e.target.checked)}
            />
            Randomize Perks
            <span
              className="info-icon"
              data-tip="Assign random minor and major perks to each hero"
            >
              ⓘ
            </span>
          </label>
        </div>
      )}

      <div className={styles.randomizeWrapper}>
        <button className={styles.randomizeBtn} onClick={randomizeAll}>
          Randomize Squad
        </button>
      </div>

      <div className={styles.buttonRow}>
        <div className={styles.buttonGrid}>
          <ShareButton
            className={styles.copyBtn}
            buildUrl={buildResultUrl}
            shareType="squad_result"
            shareSource="squad"
            label="Share squad"
            copiedLabel="Squad link copied!"
            title="Copy a link that reveals this squad"
          />
          <ShareButton
            className={styles.copyBtn}
            buildUrl={buildPresetUrl}
            shareType="squad_preset"
            shareSource="squad"
            label="Share setup"
            copiedLabel="Setup link copied!"
            title="Copy a link that sets up these slot filters and options"
          />
          <button className={styles.copyBtn} onClick={handleCopy}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "0.4rem", flexShrink: 0 }}
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {copied ? "Copied!" : "Copy as text"}
          </button>
        </div>
      </div>

      <div className={styles.slots}>
        {Array.from({ length: squadSize }, (_, i) => {
          const cfg = configs[i] || emptySlotConfig();
          const hero = heroes[i] || null;
          return (
            <SquadSlot
              key={i}
              index={i}
              hero={hero}
              name={cfg.name}
              disabledHeroes={cfg.disabledHeroes}
              perks={
                hero
                  ? perksFromIndices(
                      hero.key,
                      perkAssignments[hero.key] ?? null,
                    )
                  : null
              }
              showPerks={randomizePerks}
              onNameChange={handleNameChange}
              onDisabledChange={handleDisabledChange}
              onResetFilters={resetSlotFilters}
              onReroll={randomizeSingle}
            />
          );
        })}
      </div>
    </div>
  );
}
