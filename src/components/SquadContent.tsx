"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Hero, PerkPick, SlotConfig } from "@/types/hero";
import { perksFromIndices, randomPerkIndices } from "@/lib/heroService";
import {
  assignPerks,
  computeSquad,
  emptySlotConfig,
  enabledFromSlotConfigs,
  ensureConfigs,
  pickForSlot,
  slotConfigsFromEnabled,
} from "@/lib/squadService";
import { tryDecodeShare } from "@/lib/share/codec";
import { SquadPreset } from "@/lib/share/types";
import { readShareParam, shareUrl, stripShareParam } from "@/lib/share/urls";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  loadSquadSlotConfigs,
  saveSquadSlotConfigs,
  loadSquadSize,
  saveSquadSize,
  loadSquadForce222,
  saveSquadForce222,
  getBoolFromLS,
  setBoolToLS,
} from "@/lib/localStorage";
import ShareButton from "./ShareButton";
import SharedPresetNotice from "./SharedPresetNotice";
import SquadSlot from "./SquadSlot";
import styles from "./SquadContent.module.css";

interface SquadSetup {
  size: number;
  configs: SlotConfig[];
  force122: boolean;
  force222: boolean;
  randomizePerks: boolean;
}

export default function SquadContent() {
  const [mounted, setMounted] = useState(false);
  const [squadSize, setSquadSize] = useState(5);
  const [configs, setConfigs] = useState<SlotConfig[]>([]);
  const [heroes, setHeroes] = useState<(Hero | null)[]>([]);
  const [perkAssignments, setPerkAssignments] = useState<
    Record<string, PerkPick>
  >({});
  const [force122, setForce122] = useState(true);
  const [force222, setForce222] = useState(true);
  const [randomizePerks, setRandomizePerks] = useState(false);
  const [copied, setCopied] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [sharedPresetApplied, setSharedPresetApplied] = useState(false);
  const setupBeforeShare = useRef<SquadSetup | null>(null);

  const applySetup = useCallback((setup: SquadSetup) => {
    setSquadSize(setup.size);
    setConfigs(setup.configs);
    setForce122(setup.force122);
    setForce222(setup.force222);
    setRandomizePerks(setup.randomizePerks);

    saveSquadSize(setup.size);
    setBoolToLS("squadForce122", setup.force122);
    saveSquadForce222(setup.force222);
    setBoolToLS("squadRandomizePerks", setup.randomizePerks);

    const rolled = computeSquad(
      setup.configs,
      setup.size,
      setup.force122,
      setup.force222,
    );
    setHeroes(rolled);
    setPerkAssignments(setup.randomizePerks ? assignPerks(rolled) : {});
  }, []);

  // Load state from localStorage on mount, unless the URL carries a shared setup
  useEffect(() => {
    const saved: SquadSetup = {
      size: loadSquadSize(),
      configs: ensureConfigs(loadSquadSlotConfigs()),
      force122: getBoolFromLS("squadForce122", true),
      force222: loadSquadForce222(),
      randomizePerks: getBoolFromLS("squadRandomizePerks", false),
    };

    const shared = tryDecodeShare(readShareParam(window.location.search));
    if (shared.ok && shared.payload.kind === "squad-preset") {
      const preset = shared.payload.squad;
      setupBeforeShare.current = saved;
      applySetup({
        size: preset.size,
        configs: slotConfigsFromEnabled(preset.slots, preset.names),
        force122: preset.force122,
        force222: preset.force222,
        randomizePerks: preset.randomizePerks,
      });
      setSharedPresetApplied(true);
      stripShareParam();
    } else {
      applySetup(saved);
    }

    setMounted(true);
  }, [applySetup]);

  // Persist configs when they change
  useEffect(() => {
    if (mounted) saveSquadSlotConfigs(configs);
  }, [configs, mounted]);

  const randomizeAll = useCallback(() => {
    const newHeroes = computeSquad(configs, squadSize, force122, force222);
    setHeroes(newHeroes);
    if (randomizePerks) setPerkAssignments(assignPerks(newHeroes));
  }, [configs, force122, force222, squadSize, randomizePerks]);

  const randomizeSingle = useCallback(
    (index: number) => {
      const taken = new Set<string>();
      for (let i = 0; i < heroes.length; i++) {
        if (i !== index && heroes[i]) taken.add(heroes[i]!.key);
      }
      const cfg = configs[index] || emptySlotConfig();
      const hero = pickForSlot(cfg.disabledHeroes, taken);
      const next = [...heroes];
      next[index] = hero;
      setHeroes(next);
      if (randomizePerks && hero) {
        const pick = randomPerkIndices(hero.key);
        if (pick) {
          setPerkAssignments((prev) => ({ ...prev, [hero.key]: pick }));
        }
      }
    },
    [heroes, configs, randomizePerks],
  );

  const handleCopy = useCallback(async () => {
    const parts: string[] = [];
    for (let i = 0; i < squadSize; i++) {
      const hero = heroes[i];
      if (!hero) continue;
      const cfg = configs[i];
      const playerName = cfg?.name?.trim() || "";
      let entry = playerName ? `${playerName} - ${hero.name}` : hero.name;
      const perks = randomizePerks
        ? perksFromIndices(hero.key, perkAssignments[hero.key] ?? null)
        : null;
      if (perks) {
        entry += ` (${perks.minor}, ${perks.major})`;
      }
      parts.push(entry);
    }
    const text = parts.join(" | ");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      /* ignore */
    }
    setTimeout(() => setCopied(false), 1500);
  }, [heroes, configs, squadSize, randomizePerks, perkAssignments]);

  const handleSizeChange = useCallback(
    (size: number) => {
      setSquadSize(size);
      saveSquadSize(size);
      // Re-randomize with new size
      const newHeroes = computeSquad(configs, size, force122, force222);
      setHeroes(newHeroes);
      if (randomizePerks) setPerkAssignments(assignPerks(newHeroes));
    },
    [configs, force122, force222, randomizePerks],
  );

  const handleNameChange = useCallback(
    (index: number, name: string) => {
      const next = ensureConfigs([...configs]);
      next[index] = { ...next[index], name };
      setConfigs(next);
    },
    [configs],
  );

  const handleDisabledChange = useCallback(
    (index: number, disabled: Set<string>) => {
      const next = ensureConfigs([...configs]);
      next[index] = { ...next[index], disabledHeroes: disabled };
      setConfigs(next);
    },
    [configs],
  );

  const resetSlotFilters = useCallback(
    (index: number) => {
      const next = ensureConfigs([...configs]);
      next[index] = { ...next[index], disabledHeroes: new Set<string>() };
      setConfigs(next);
    },
    [configs],
  );

  const resetAllFilters = useCallback(() => {
    setConfigs((prev) =>
      prev.map((cfg) => ({ ...cfg, disabledHeroes: new Set<string>() })),
    );
  }, []);

  const handleForce122Change = useCallback((checked: boolean) => {
    setForce122(checked);
    setBoolToLS("squadForce122", checked);
  }, []);

  const handleForce222Change = useCallback((checked: boolean) => {
    setForce222(checked);
    saveSquadForce222(checked);
  }, []);

  const handlePerksChange = useCallback(
    (checked: boolean) => {
      setRandomizePerks(checked);
      setBoolToLS("squadRandomizePerks", checked);
      if (checked) {
        setPerkAssignments(assignPerks(heroes));
      }
    },
    [heroes],
  );

  const currentPreset = useCallback(
    (): SquadPreset => ({
      size: squadSize,
      force122,
      force222,
      randomizePerks,
      slots: enabledFromSlotConfigs(configs),
      names: ensureConfigs(configs).map((cfg) => cfg.name),
    }),
    [squadSize, force122, force222, randomizePerks, configs],
  );

  const buildResultUrl = useCallback(
    () =>
      shareUrl({
        kind: "squad-result",
        squad: currentPreset(),
        result: {
          heroes: Array.from(
            { length: squadSize },
            (_, i) => heroes[i]?.key ?? null,
          ),
          perks: Array.from({ length: squadSize }, (_, i) => {
            const hero = heroes[i];
            if (!randomizePerks || !hero) return null;
            return perkAssignments[hero.key] ?? null;
          }),
        },
      }),
    [currentPreset, heroes, squadSize, randomizePerks, perkAssignments],
  );

  const buildPresetUrl = useCallback(
    () => shareUrl({ kind: "squad-preset", squad: currentPreset() }),
    [currentPreset],
  );

  const handleUndoShared = useCallback(() => {
    const previous = setupBeforeShare.current;
    if (previous) applySetup(previous);
    setSharedPresetApplied(false);
  }, [applySetup]);

  useKeyboardShortcuts({
    r: randomizeAll,
    "ctrl+c": handleCopy,
  });

  const hasAnyActiveFilters = configs
    .slice(0, squadSize)
    .some((cfg) => cfg.disabledHeroes.size > 0);

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      {sharedPresetApplied && (
        <SharedPresetNotice
          message="A shared squad setup has been applied, replacing your own filters and options."
          onUndo={handleUndoShared}
          onDismiss={() => setSharedPresetApplied(false)}
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
            label="Share squad"
            copiedLabel="Squad link copied!"
            title="Copy a link that reveals this squad"
          />
          <ShareButton
            className={styles.copyBtn}
            buildUrl={buildPresetUrl}
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
