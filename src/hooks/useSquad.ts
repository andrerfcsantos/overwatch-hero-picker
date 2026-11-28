"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { track } from "@/lib/analytics";
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

interface SquadSetup {
  size: number;
  configs: SlotConfig[];
  force122: boolean;
  force222: boolean;
  randomizePerks: boolean;
}

/**
 * Everything the squad generator does, without any of how it looks: the roll,
 * per-slot filters and names, options, share links, copy as text, and the
 * keyboard shortcuts. The classic and the new design are two views over this
 * one hook, so a behaviour change lands in both.
 *
 * Call it once per page, above the choice of design (see `SquadPage`), and
 * hand the result to whichever view is showing. A second instance would roll
 * a new squad and lose a shared setup's undo, which is what switching design
 * must not do.
 */
export function useSquad() {
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
  const [rollCount, setRollCount] = useState(0);
  const [squadRollCount, setSquadRollCount] = useState(0);
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

    const raw = readShareParam(window.location.search);
    const shared = tryDecodeShare(raw);
    if (shared.ok && shared.payload.kind === "squad-preset") {
      const preset = shared.payload.squad;
      setupBeforeShare.current = saved;
      // oxlint-disable-next-line react-hooks/set-state-in-effect -- localStorage and the URL are only read after mount
      applySetup({
        size: preset.size,
        configs: slotConfigsFromEnabled(preset.slots, preset.names),
        force122: preset.force122,
        force222: preset.force222,
        randomizePerks: preset.randomizePerks,
      });
      setSharedPresetApplied(true);
      stripShareParam();
      track("shared_link_opened", { share_type: "squad_preset", valid: true });
    } else {
      if (raw && !shared.ok) {
        track("shared_link_opened", {
          share_type: "unknown",
          valid: false,
          invalid_reason: shared.reason,
        });
      }
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
    setRollCount((count) => count + 1);
    setSquadRollCount((count) => count + 1);
    if (randomizePerks) setPerkAssignments(assignPerks(newHeroes));
    track("squad_randomized", {
      source: "generator",
      squad_size: squadSize,
      force_122: force122,
      force_222: force222,
      perks_enabled: randomizePerks,
      filtered_slot_count: configs
        .slice(0, squadSize)
        .filter((cfg) => cfg.disabledHeroes.size > 0).length,
    });
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
      setRollCount((count) => count + 1);
      if (randomizePerks && hero) {
        const pick = randomPerkIndices(hero.key);
        if (pick) {
          setPerkAssignments((prev) => ({ ...prev, [hero.key]: pick }));
        }
      }
      track("squad_slot_rerolled", {
        source: "generator",
        squad_size: squadSize,
        slot_index: index,
        perks_enabled: randomizePerks,
      });
    },
    [heroes, configs, randomizePerks, squadSize],
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
      track("squad_copied_as_text", {
        squad_size: squadSize,
        perks_enabled: randomizePerks,
      });
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
      track("squad_size_changed", { squad_size: size });
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

  // Slot filters change one checkbox at a time, so edits are debounced into a
  // single event carrying the final count instead of one event per click.
  const filterEditTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    const timers = filterEditTimers.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  const handleDisabledChange = useCallback(
    (index: number, disabled: Set<string>) => {
      const next = ensureConfigs([...configs]);
      next[index] = { ...next[index], disabledHeroes: disabled };
      setConfigs(next);

      const timers = filterEditTimers.current;
      const existing = timers.get(index);
      if (existing) clearTimeout(existing);
      timers.set(
        index,
        setTimeout(() => {
          timers.delete(index);
          track("squad_slot_filters_changed", {
            action: "edit",
            slot_index: index,
            disabled_count: disabled.size,
          });
        }, 2000),
      );
    },
    [configs],
  );

  const resetSlotFilters = useCallback(
    (index: number) => {
      const next = ensureConfigs([...configs]);
      next[index] = { ...next[index], disabledHeroes: new Set<string>() };
      setConfigs(next);
      track("squad_slot_filters_changed", {
        action: "reset",
        slot_index: index,
        disabled_count: 0,
      });
    },
    [configs],
  );

  const resetAllFilters = useCallback(() => {
    setConfigs((prev) =>
      prev.map((cfg) => ({ ...cfg, disabledHeroes: new Set<string>() })),
    );
    track("squad_slot_filters_changed", {
      action: "reset_all",
      slot_index: null,
      disabled_count: 0,
    });
  }, []);

  const handleForce122Change = useCallback((checked: boolean) => {
    setForce122(checked);
    setBoolToLS("squadForce122", checked);
    track("squad_option_changed", { option: "force_122", enabled: checked });
  }, []);

  const handleForce222Change = useCallback((checked: boolean) => {
    setForce222(checked);
    saveSquadForce222(checked);
    track("squad_option_changed", { option: "force_222", enabled: checked });
  }, []);

  const handlePerksChange = useCallback(
    (checked: boolean) => {
      setRandomizePerks(checked);
      setBoolToLS("squadRandomizePerks", checked);
      if (checked) {
        setPerkAssignments(assignPerks(heroes));
      }
      track("squad_option_changed", {
        option: "randomize_perks",
        enabled: checked,
      });
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
    track("shared_preset_undone", { share_type: "squad_preset" });
  }, [applySetup]);

  const handleDismissShared = useCallback(() => {
    setSharedPresetApplied(false);
    track("shared_preset_dismissed", { share_type: "squad_preset" });
  }, []);

  useKeyboardShortcuts({
    r: randomizeAll,
    "ctrl+c": handleCopy,
  });

  const hasAnyActiveFilters = configs
    .slice(0, squadSize)
    .some((cfg) => cfg.disabledHeroes.size > 0);

  return {
    /** False until saved setup has been read; render nothing before it. */
    mounted,
    squadSize,
    configs,
    heroes,
    perkAssignments,
    /** Rolls the visitor asked for, whole squad or one player. */
    rollCount,
    /** Rolls of the whole squad only. */
    squadRollCount,
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
  };
}

export type Squad = ReturnType<typeof useSquad>;
