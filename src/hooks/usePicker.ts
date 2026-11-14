"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { heroPoolProps, track } from "@/lib/analytics";
import { Hero, HeroRole, PerkPick } from "@/types/hero";
import { useHeroes } from "@/context/HeroContext";
import { usePresets } from "@/context/PresetContext";
import { SHORTCUT_COUNT, shortcutForIndex } from "@/lib/presets/types";
import {
  perksFromIndices,
  randomHero,
  randomPerkIndices,
} from "@/lib/heroService";
import { getBoolFromLS, setBoolToLS } from "@/lib/localStorage";
import { PickerPreset } from "@/lib/share/types";
import { shareUrl } from "@/lib/share/urls";
import { OverlaySize, overlayUrl } from "@/lib/overlay";
import type { Design } from "@/lib/design";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

/**
 * Everything the random hero page does, without any of how it looks: the roll,
 * the options, share and overlay links, shared-preset undo, and the keyboard
 * shortcuts. The classic and the new design are two views over this one hook,
 * so a behaviour change lands in both.
 *
 * Call it once per page, above the choice of design (see `PickerPage`), and
 * hand the result to whichever view is showing. A second instance would roll
 * its own hero and apply a shared link's options a second time, which is what
 * switching design must not do.
 */
export function usePicker() {
  const {
    heroes,
    getSelected,
    getSelectedByRole,
    getByRole,
    selectByRole,
    unselectByRole,
    unselectAll,
    sharedPreset,
    sharedPresetApplied,
    undoSharedPreset,
    dismissSharedPreset,
  } = useHeroes();
  const { presets, applyPreset } = usePresets();

  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [perks, setPerks] = useState<PerkPick | null>(null);
  const [heroCount, setHeroCount] = useState(0);
  const [showPortrait, setShowPortrait] = useState(true);
  const [showPerks, setShowPerks] = useState(true);
  const [nonRepeatingMode, setNonRepeatingMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [perksCount, setPerksCount] = useState(0);
  const [lastRoll, setLastRoll] = useState<"hero" | "perks" | null>(null);
  const optionsBeforeShare = useRef<{
    showPortrait: boolean;
    showPerks: boolean;
    nonRepeating: boolean;
  } | null>(null);

  // Restore preferences and pick initial hero
  useEffect(() => {
    // oxlint-disable-next-line react-hooks/set-state-in-effect -- saved options are in localStorage, read after mount
    setShowPortrait(getBoolFromLS("showPortrait", true));
    setShowPerks(getBoolFromLS("showPerks", true));
    setNonRepeatingMode(getBoolFromLS("nonRepeatingMode", false));
    setMounted(true);
  }, []);

  // A shared preset carries options as well as filters. The provider publishes
  // it after this hook has already restored the saved preferences, so it
  // lands here as an update rather than an initial value.
  useEffect(() => {
    if (!sharedPreset) return;
    optionsBeforeShare.current = {
      showPortrait: getBoolFromLS("showPortrait", true),
      showPerks: getBoolFromLS("showPerks", true),
      nonRepeating: getBoolFromLS("nonRepeatingMode", false),
    };
    // oxlint-disable-next-line react-hooks/set-state-in-effect -- the provider publishes a shared preset after mount
    setShowPortrait(sharedPreset.showPortrait);
    setShowPerks(sharedPreset.showPerks);
    setNonRepeatingMode(sharedPreset.nonRepeating);
    setBoolToLS("showPortrait", sharedPreset.showPortrait);
    setBoolToLS("showPerks", sharedPreset.showPerks);
    setBoolToLS("nonRepeatingMode", sharedPreset.nonRepeating);
  }, [sharedPreset]);

  // Pick initial hero once heroes are available
  useEffect(() => {
    if (mounted && heroes.length > 0 && !selectedHero) {
      const hero = randomHero(heroes);
      // oxlint-disable-next-line react-hooks/set-state-in-effect -- the opening roll is random, so it waits for the client
      setSelectedHero(hero);
      setPerks(randomPerkIndices(hero.key));
    }
  }, [mounted, heroes, selectedHero]);

  const handleRandomHero = useCallback(() => {
    const selected = getSelected();
    const pool = selected.length > 0 ? selected : heroes;
    const hero = randomHero(pool, {
      preventRepeat: nonRepeatingMode,
      previousHeroKey: selectedHero?.key ?? "",
    });
    setSelectedHero(hero);
    setPerks(randomPerkIndices(hero.key));
    setHeroCount((c) => c + 1);
    setPerksCount((c) => c + 1);
    setLastRoll("hero");
    track("hero_randomized", {
      source: "picker",
      hero_key: hero.key,
      hero_role: hero.role,
      non_repeating: nonRepeatingMode,
      perks_enabled: showPerks,
      ...heroPoolProps(pool),
    });
  }, [heroes, getSelected, nonRepeatingMode, selectedHero, showPerks]);

  const handleNewPerks = useCallback(() => {
    if (selectedHero) {
      setPerks(randomPerkIndices(selectedHero.key));
      setPerksCount((c) => c + 1);
      setLastRoll("perks");
      track("perks_randomized", {
        source: "picker",
        hero_key: selectedHero.key,
        hero_role: selectedHero.role,
      });
    }
  }, [selectedHero]);

  // Setting an option and the visitor choosing it are different things: the
  // undo path below also restores options, and that must not look like clicks.
  const applyShowPortrait = (checked: boolean) => {
    setShowPortrait(checked);
    setBoolToLS("showPortrait", checked);
  };

  const applyShowPerks = (checked: boolean) => {
    setShowPerks(checked);
    setBoolToLS("showPerks", checked);
  };

  const applyNonRepeating = (checked: boolean) => {
    setNonRepeatingMode(checked);
    setBoolToLS("nonRepeatingMode", checked);
  };

  const handleShowPortrait = (checked: boolean) => {
    applyShowPortrait(checked);
    track("picker_option_changed", {
      option: "show_portrait",
      enabled: checked,
    });
  };

  const handleShowPerks = (checked: boolean) => {
    applyShowPerks(checked);
    track("picker_option_changed", {
      option: "randomize_perks",
      enabled: checked,
    });
  };

  const handleNonRepeating = (checked: boolean) => {
    applyNonRepeating(checked);
    track("picker_option_changed", {
      option: "non_repeating",
      enabled: checked,
    });
  };

  const currentPreset = useCallback(
    (): PickerPreset => ({
      selected: getSelected().map((hero) => hero.key),
      showPortrait,
      showPerks,
      nonRepeating: nonRepeatingMode,
    }),
    [getSelected, showPortrait, showPerks, nonRepeatingMode],
  );

  const buildResultUrl = useCallback(
    () =>
      shareUrl({
        kind: "hero-result",
        picker: currentPreset(),
        result: {
          heroKey: selectedHero?.key ?? null,
          perks: showPerks ? perks : null,
        },
      }),
    [currentPreset, selectedHero, showPerks, perks],
  );

  const buildPresetUrl = useCallback(
    () => shareUrl({ kind: "picker-preset", picker: currentPreset() }),
    [currentPreset],
  );

  const buildOverlayUrl = useCallback(
    (size: OverlaySize, room: string | null, design: Design) =>
      overlayUrl(currentPreset(), size, room, design),
    [currentPreset],
  );

  const handleUndoShared = useCallback(() => {
    const previous = optionsBeforeShare.current;
    if (previous) {
      applyShowPortrait(previous.showPortrait);
      applyShowPerks(previous.showPerks);
      applyNonRepeating(previous.nonRepeating);
    }
    undoSharedPreset();
    track("shared_preset_undone", { share_type: "picker_preset" });
  }, [undoSharedPreset]);

  const handleDismissShared = useCallback(() => {
    dismissSharedPreset();
    track("shared_preset_dismissed", { share_type: "picker_preset" });
  }, [dismissSharedPreset]);

  const toggleRole = useCallback(
    (role: HeroRole) => {
      const allOfRole = getByRole(role);
      const selectedOfRole = getSelectedByRole(role);
      if (selectedOfRole.length === allOfRole.length) {
        unselectByRole(role);
      } else {
        selectByRole(role);
      }
    },
    [getByRole, getSelectedByRole, selectByRole, unselectByRole],
  );

  // The first ten presets answer to the number row, in list order. The order is
  // the visitor's to change on the manage page, so the keys follow it.
  const presetShortcuts = useMemo(() => {
    const map: Record<string, () => void> = {};
    presets.slice(0, SHORTCUT_COUNT).forEach((preset, index) => {
      const key = shortcutForIndex(index);
      if (key) map[key] = () => applyPreset(preset.id, "keyboard");
    });
    return map;
  }, [presets, applyPreset]);

  useKeyboardShortcuts({
    r: handleRandomHero,
    t: () => toggleRole("TANK"),
    d: () => toggleRole("DAMAGE"),
    s: () => toggleRole("SUPPORT"),
    u: unselectAll,
    p: handleNewPerks,
    ...presetShortcuts,
  });

  const perkLabels = selectedHero
    ? perksFromIndices(selectedHero.key, perks)
    : null;

  return {
    /** False until saved options have been read; render nothing before it. */
    mounted,
    selectedHero,
    perkLabels,
    /** Rolls the visitor asked for, which is also a key for replaying motion. */
    heroCount,
    perksCount,
    /** What the visitor last asked for, or null before they have rolled. */
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
  };
}

export type Picker = ReturnType<typeof usePicker>;
