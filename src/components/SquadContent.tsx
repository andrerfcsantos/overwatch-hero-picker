"use client";

import { useState, useEffect, useCallback } from "react";
import { Hero } from "@/types/hero";
import { getAllHeroes, getHeroesByRole } from "@/data/heroes";
import { heroPerks } from "@/data/heroPerks";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  SlotConfig,
  loadSquadSlotConfigs,
  saveSquadSlotConfigs,
  loadSquadSize,
  saveSquadSize,
  loadSquadForce222,
  saveSquadForce222,
  getBoolFromLS,
  setBoolToLS,
} from "@/lib/localStorage";
import SquadSlot from "./SquadSlot";
import styles from "./SquadContent.module.css";

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickForSlot(disabledHeroes: Set<string>, taken: Set<string>): Hero | null {
  const all = getAllHeroes();
  let pool = all.filter((h) => !disabledHeroes.has(h.key) && !taken.has(h.key));
  if (pool.length === 0) {
    // Fallback: ignore filters, just avoid duplicates
    pool = all.filter((h) => !taken.has(h.key));
  }
  if (pool.length === 0) return null;
  return pickRandom(pool);
}

function computeRandomHeroes(
  configs: SlotConfig[],
  size: number,
): (Hero | null)[] {
  const result: (Hero | null)[] = [];
  const taken = new Set<string>();
  for (let i = 0; i < size; i++) {
    const cfg = configs[i] || { name: "", disabledHeroes: new Set<string>() };
    const hero = pickForSlot(cfg.disabledHeroes, taken);
    if (hero) taken.add(hero.key);
    result.push(hero);
  }
  return result;
}

function compute122Heroes(configs: SlotConfig[]): (Hero | null)[] {
  // Force 1 Tank, 2 Damage, 2 Support
  const roleSlots: Array<"TANK" | "DAMAGE" | "SUPPORT"> = [
    "TANK",
    "DAMAGE",
    "DAMAGE",
    "SUPPORT",
    "SUPPORT",
  ];
  const result: (Hero | null)[] = [];
  const taken = new Set<string>();

  for (let i = 0; i < 5; i++) {
    const cfg = configs[i] || { name: "", disabledHeroes: new Set<string>() };
    const role = roleSlots[i];
    const roleHeroes = getHeroesByRole(role);
    let pool = roleHeroes.filter(
      (h) => !cfg.disabledHeroes.has(h.key) && !taken.has(h.key),
    );
    if (pool.length === 0) {
      pool = roleHeroes.filter((h) => !taken.has(h.key));
    }
    if (pool.length === 0) {
      result.push(null);
    } else {
      const hero = pickRandom(pool);
      taken.add(hero.key);
      result.push(hero);
    }
  }
  return result;
}

function compute222Heroes(configs: SlotConfig[]): (Hero | null)[] {
  // Force 2 Tank, 2 Damage, 2 Support
  const roleSlots: Array<"TANK" | "DAMAGE" | "SUPPORT"> = [
    "TANK",
    "TANK",
    "DAMAGE",
    "DAMAGE",
    "SUPPORT",
    "SUPPORT",
  ];
  const result: (Hero | null)[] = [];
  const taken = new Set<string>();

  for (let i = 0; i < 6; i++) {
    const cfg = configs[i] || { name: "", disabledHeroes: new Set<string>() };
    const role = roleSlots[i];
    const roleHeroes = getHeroesByRole(role);
    let pool = roleHeroes.filter(
      (h) => !cfg.disabledHeroes.has(h.key) && !taken.has(h.key),
    );
    if (pool.length === 0) {
      pool = roleHeroes.filter((h) => !taken.has(h.key));
    }
    if (pool.length === 0) {
      result.push(null);
    } else {
      const hero = pickRandom(pool);
      taken.add(hero.key);
      result.push(hero);
    }
  }
  return result;
}

function assignPerks(
  heroes: (Hero | null)[],
): Record<string, { minor: string; major: string }> {
  const assignments: Record<string, { minor: string; major: string }> = {};
  for (const hero of heroes) {
    if (!hero) continue;
    const perks = heroPerks[hero.key];
    if (perks) {
      assignments[hero.key] = {
        minor: perks.minor[Math.floor(Math.random() * perks.minor.length)],
        major: perks.major[Math.floor(Math.random() * perks.major.length)],
      };
    }
  }
  return assignments;
}

const MAX_SLOTS = 6;

function ensureConfigs(configs: SlotConfig[], count: number): SlotConfig[] {
  const result = [...configs];
  while (result.length < count) {
    result.push({ name: "", disabledHeroes: new Set<string>() });
  }
  return result;
}

export default function SquadContent() {
  const [mounted, setMounted] = useState(false);
  const [squadSize, setSquadSize] = useState(5);
  const [configs, setConfigs] = useState<SlotConfig[]>([]);
  const [heroes, setHeroes] = useState<(Hero | null)[]>([]);
  const [perkAssignments, setPerkAssignments] = useState<
    Record<string, { minor: string; major: string }>
  >({});
  const [force122, setForce122] = useState(true);
  const [force222, setForce222] = useState(true);
  const [randomizePerks, setRandomizePerks] = useState(false);
  const [copied, setCopied] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedSize = loadSquadSize();
    const savedConfigs = ensureConfigs(loadSquadSlotConfigs(), MAX_SLOTS);
    const savedForce122 = getBoolFromLS("squadForce122", true);
    const savedForce222 = loadSquadForce222();
    const savedPerks = getBoolFromLS("squadRandomizePerks", false);

    setSquadSize(savedSize);
    setConfigs(savedConfigs);
    setForce122(savedForce122);
    setForce222(savedForce222);
    setRandomizePerks(savedPerks);

    // Generate initial squad
    const initial =
      savedForce122 && savedSize === 5
        ? compute122Heroes(savedConfigs)
        : savedForce222 && savedSize === 6
          ? compute222Heroes(savedConfigs)
          : computeRandomHeroes(savedConfigs, savedSize);
    setHeroes(initial);
    if (savedPerks) setPerkAssignments(assignPerks(initial));

    setMounted(true);
  }, []);

  // Persist configs when they change
  useEffect(() => {
    if (mounted) saveSquadSlotConfigs(configs);
  }, [configs, mounted]);

  const randomizeAll = useCallback(() => {
    const cfgs = ensureConfigs(configs, MAX_SLOTS);
    const newHeroes =
      force122 && squadSize === 5
        ? compute122Heroes(cfgs)
        : force222 && squadSize === 6
          ? compute222Heroes(cfgs)
          : computeRandomHeroes(cfgs, squadSize);
    setHeroes(newHeroes);
    if (randomizePerks) setPerkAssignments(assignPerks(newHeroes));
  }, [configs, force122, force222, squadSize, randomizePerks]);

  const randomizeSingle = useCallback(
    (index: number) => {
      const taken = new Set<string>();
      for (let i = 0; i < heroes.length; i++) {
        if (i !== index && heroes[i]) taken.add(heroes[i]!.key);
      }
      const cfg = configs[index] || {
        name: "",
        disabledHeroes: new Set<string>(),
      };
      const hero = pickForSlot(cfg.disabledHeroes, taken);
      const next = [...heroes];
      next[index] = hero;
      setHeroes(next);
      if (randomizePerks && hero) {
        setPerkAssignments((prev) => {
          const perks = heroPerks[hero.key];
          if (!perks) return prev;
          return {
            ...prev,
            [hero.key]: {
              minor:
                perks.minor[Math.floor(Math.random() * perks.minor.length)],
              major:
                perks.major[Math.floor(Math.random() * perks.major.length)],
            },
          };
        });
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
      if (randomizePerks && perkAssignments[hero.key]) {
        const p = perkAssignments[hero.key];
        entry += ` (${p.minor}, ${p.major})`;
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
      const cfgs = ensureConfigs(configs, MAX_SLOTS);
      const newHeroes =
        force122 && size === 5
          ? compute122Heroes(cfgs)
          : force222 && size === 6
            ? compute222Heroes(cfgs)
            : computeRandomHeroes(cfgs, size);
      setHeroes(newHeroes);
      if (randomizePerks) setPerkAssignments(assignPerks(newHeroes));
    },
    [configs, force122, force222, randomizePerks],
  );

  const handleNameChange = useCallback(
    (index: number, name: string) => {
      const next = ensureConfigs([...configs], MAX_SLOTS);
      next[index] = { ...next[index], name };
      setConfigs(next);
    },
    [configs],
  );

  const handleDisabledChange = useCallback(
    (index: number, disabled: Set<string>) => {
      const next = ensureConfigs([...configs], MAX_SLOTS);
      next[index] = { ...next[index], disabledHeroes: disabled };
      setConfigs(next);
    },
    [configs],
  );

  const resetSlotFilters = useCallback(
    (index: number) => {
      const next = ensureConfigs([...configs], MAX_SLOTS);
      next[index] = { ...next[index], disabledHeroes: new Set<string>() };
      setConfigs(next);
    },
    [configs],
  );

  const resetAllFilters = useCallback(() => {
    setConfigs((prev) => prev.map((cfg) => ({ ...cfg, disabledHeroes: new Set<string>() })));
  }, []);

  const handleForce122Change = useCallback(
    (checked: boolean) => {
      setForce122(checked);
      setBoolToLS("squadForce122", checked);
    },
    [],
  );

  const handleForce222Change = useCallback(
    (checked: boolean) => {
      setForce222(checked);
      saveSquadForce222(checked);
    },
    [],
  );

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

  useKeyboardShortcuts({
    r: randomizeAll,
    "ctrl+c": handleCopy,
  });

  const hasAnyActiveFilters = configs.slice(0, squadSize).some((cfg) => cfg.disabledHeroes.size > 0);

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Build Your Squad</h1>

      <div className="mt-3 mb-1 max-w-1/2">
        <p className="text-gray-400 m-0 mb-2">
          Choose your squad size and hit <strong>Randomize Squad</strong> to get
          a random squad.
          <br />
          You can select the pool of random heroes for each slot and give it a
          name.
          <br/>
          <strong>Copy to clipboard</strong> to share the squad with others!
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

      <div className={styles.randomizeWrapper}>
        <button className={styles.randomizeBtn} onClick={randomizeAll}>
          Randomize Squad
        </button>
      </div>

      <div
        className={styles.optionsToggle}
        onClick={() => setOptionsOpen(!optionsOpen)}
      >
        ⚙ Options {optionsOpen ? "▾" : "▸"}
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

      <div className={styles.buttonRow}>
        {hasAnyActiveFilters && (
          <button className={styles.resetFiltersBtn} onClick={resetAllFilters}>
            Reset All Filters
          </button>
        )}
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
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
      </div>

      <div className={styles.slots}>
        {Array.from({ length: squadSize }, (_, i) => {
          const cfg = configs[i] || {
            name: "",
            disabledHeroes: new Set<string>(),
          };
          return (
            <SquadSlot
              key={i}
              index={i}
              hero={heroes[i] || null}
              name={cfg.name}
              disabledHeroes={cfg.disabledHeroes}
              perks={
                heroes[i] && perkAssignments[heroes[i]!.key]
                  ? perkAssignments[heroes[i]!.key]
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
