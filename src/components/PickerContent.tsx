"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Hero, PerkPick } from "@/types/hero";
import { HeroRole } from "@/types/hero";
import { useHeroes } from "@/context/HeroContext";
import {
  perksFromIndices,
  randomHero,
  randomPerkIndices,
} from "@/lib/heroService";
import { getBoolFromLS, setBoolToLS } from "@/lib/localStorage";
import { PickerPreset } from "@/lib/share/types";
import { shareUrl } from "@/lib/share/urls";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import HeroFilterPanel from "@/components/HeroFilterPanel";
import ShareButton from "@/components/ShareButton";
import SharedPresetNotice from "@/components/SharedPresetNotice";
import SpriteIcon from "@/components/SpriteIcon";
import RoleSpriteIcon from "@/components/RoleSpriteIcon";

export default function PickerContent() {
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

  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [perks, setPerks] = useState<PerkPick | null>(null);
  const [heroCount, setHeroCount] = useState(0);
  const [showPortrait, setShowPortrait] = useState(true);
  const [showPerks, setShowPerks] = useState(true);
  const [nonRepeatingMode, setNonRepeatingMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [perksCount, setPerksCount] = useState(0);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const portraitRef = useRef<HTMLDivElement>(null);
  const optionsBeforeShare = useRef<{
    showPortrait: boolean;
    showPerks: boolean;
    nonRepeating: boolean;
  } | null>(null);

  // Restore preferences and pick initial hero
  useEffect(() => {
    setShowPortrait(getBoolFromLS("showPortrait", true));
    setShowPerks(getBoolFromLS("showPerks", true));
    setNonRepeatingMode(getBoolFromLS("nonRepeatingMode", false));
    setMounted(true);
  }, []);

  // A shared preset carries options as well as filters. The provider publishes
  // it after this component has already restored the saved preferences, so it
  // lands here as an update rather than an initial value.
  useEffect(() => {
    if (!sharedPreset) return;
    optionsBeforeShare.current = {
      showPortrait: getBoolFromLS("showPortrait", true),
      showPerks: getBoolFromLS("showPerks", true),
      nonRepeating: getBoolFromLS("nonRepeatingMode", false),
    };
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

    // Re-trigger portrait animation without remounting
    if (portraitRef.current) {
      portraitRef.current.classList.remove("hero-portrait-animate");
      void portraitRef.current.offsetWidth;
      portraitRef.current.classList.add("hero-portrait-animate");
    }
  }, [heroes, getSelected, nonRepeatingMode, selectedHero]);

  const handleNewPerks = useCallback(() => {
    if (selectedHero) {
      setPerks(randomPerkIndices(selectedHero.key));
      setPerksCount((c) => c + 1);
    }
  }, [selectedHero]);

  const handleShowPortrait = (checked: boolean) => {
    setShowPortrait(checked);
    setBoolToLS("showPortrait", checked);
  };

  const handleShowPerks = (checked: boolean) => {
    setShowPerks(checked);
    setBoolToLS("showPerks", checked);
  };

  const handleNonRepeating = (checked: boolean) => {
    setNonRepeatingMode(checked);
    setBoolToLS("nonRepeatingMode", checked);
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

  const handleUndoShared = useCallback(() => {
    const previous = optionsBeforeShare.current;
    if (previous) {
      handleShowPortrait(previous.showPortrait);
      handleShowPerks(previous.showPerks);
      handleNonRepeating(previous.nonRepeating);
    }
    undoSharedPreset();
  }, [undoSharedPreset]);

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

  useKeyboardShortcuts({
    r: handleRandomHero,
    t: () => toggleRole("TANK"),
    d: () => toggleRole("DAMAGE"),
    s: () => toggleRole("SUPPORT"),
    u: unselectAll,
    p: handleNewPerks,
  });

  if (!mounted) return null;

  const perkLabels = selectedHero
    ? perksFromIndices(selectedHero.key, perks)
    : null;

  return (
    <div className="w-full overflow-x-hidden bg-[#2c3e50] text-white min-h-[85vh] mb-4">
      {sharedPresetApplied && (
        <div className="px-[3%] pt-2">
          <SharedPresetNotice
            message="Filters and options from a shared link have been applied, replacing your own."
            onUndo={handleUndoShared}
            onDismiss={dismissSharedPreset}
          />
        </div>
      )}

      <div className="flex flex-col lg:flex-row w-full">
        {/* Left panel */}
        <div className="w-full lg:w-1/4 flex flex-col px-[3%] text-center">
          <h1 className="text-white">You should play</h1>

          <button
            className="options-toggle"
            onClick={() => setOptionsOpen(!optionsOpen)}
          >
            ⚙ Options {optionsOpen ? "▾" : "▸"}
          </button>
          {optionsOpen && (
            <div className="mb-2">
              <div>
                <input
                  id="checkbox-show-portrait"
                  type="checkbox"
                  checked={showPortrait}
                  onChange={(e) => handleShowPortrait(e.target.checked)}
                />
                <label htmlFor="checkbox-show-portrait" className="ml-1 mr-1">
                  Show hero portrait
                </label>
                <span
                  className="info-icon"
                  data-tip="Show or hide the full hero portrait image"
                >
                  ⓘ
                </span>

                <input
                  id="checkbox-show-perks"
                  type="checkbox"
                  checked={showPerks}
                  className="ml-2"
                  onChange={(e) => handleShowPerks(e.target.checked)}
                />
                <label htmlFor="checkbox-show-perks" className="ml-1 mr-1">
                  Randomize perks
                </label>
                <span
                  className="info-icon"
                  data-tip="Randomly assign ability perks when picking a hero"
                >
                  ⓘ
                </span>
              </div>

              <div>
                <input
                  id="checkbox-non-repeating"
                  type="checkbox"
                  checked={nonRepeatingMode}
                  onChange={(e) => handleNonRepeating(e.target.checked)}
                />
                <label htmlFor="checkbox-non-repeating" className="ml-1 mr-1">
                  Non-repeating mode
                </label>
                <span
                  className="info-icon"
                  data-tip="Prevent the same hero from being picked twice in a row"
                >
                  ⓘ
                </span>
              </div>
            </div>
          )}

          {showPortrait && selectedHero && (
            <SpriteIcon
              ref={portraitRef}
              heroKey={selectedHero.key}
              type="portrait"
              className="hero-portrait mx-auto hero-portrait-animate"
              alt={`${selectedHero.name} portrait`}
            />
          )}

          {selectedHero && (
            <>
              <h2
                key={`hero-name-${heroCount}`}
                className="hero-name-animate mx-4 mt-4 mb-0 !text-[2.2rem] flex items-center justify-center gap-2"
              >
                <RoleSpriteIcon
                  roleKey={selectedHero.role}
                  alt={selectedHero.role}
                  className="w-8 h-8"
                />
                {selectedHero.name}
              </h2>
              {showPerks && perkLabels && (
                <div className="mx-4 mb-4" style={{ marginTop: "0.8em" }}>
                  <span
                    key={`perks-${perksCount}`}
                    className="perks-animate text-[1.2rem] leading-snug"
                  >
                    <span className="text-blue-300">{perkLabels.minor}</span>{" "}
                    <span className="text-gray-500">|</span>{" "}
                    <span className="text-yellow-300">{perkLabels.major}</span>
                  </span>
                  <br />
                  <button
                    className="action-button btn-perks text-[1.2rem] !px-2 !py-1 !mt-3"
                    onClick={handleNewPerks}
                  >
                    ↻ Randomize perks
                  </button>
                </div>
              )}
            </>
          )}

          <button
            className="random-hero-button btn-orange"
            onClick={handleRandomHero}
          >
            Randomize Hero
          </button>

          {selectedHero && (
            <div className="mt-2">
              <ShareButton
                buildUrl={buildResultUrl}
                label="Share this hero"
                title="Copy a link that reveals this hero"
              />
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-3/4">
          <HeroFilterPanel buildPresetUrl={buildPresetUrl} />
        </div>
      </div>
    </div>
  );
}
