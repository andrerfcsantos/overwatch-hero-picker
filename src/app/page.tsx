"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Hero } from "@/types/hero";
import { useHeroes } from "@/context/HeroContext";
import { randomHero, getRandomHeroPerks } from "@/lib/heroService";
import { getBoolFromLS, setBoolToLS } from "@/lib/localStorage";
import HeroFilterPanel from "@/components/HeroFilterPanel";
import SpriteIcon from "@/components/SpriteIcon";

export default function PickerPage() {
  const { heroes, getSelected } = useHeroes();

  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [perks, setPerks] = useState<[string, string]>(["", ""]);
  const [heroCount, setHeroCount] = useState(0);
  const [showPortrait, setShowPortrait] = useState(true);
  const [showPerks, setShowPerks] = useState(true);
  const [nonRepeatingMode, setNonRepeatingMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [perksCount, setPerksCount] = useState(0);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const portraitRef = useRef<HTMLDivElement>(null);

  // Restore preferences and pick initial hero
  useEffect(() => {
    setShowPortrait(getBoolFromLS("showPortrait", true));
    setShowPerks(getBoolFromLS("showPerks", true));
    setNonRepeatingMode(getBoolFromLS("nonRepeatingMode", false));
    setMounted(true);
  }, []);

  // Pick initial hero once heroes are available
  useEffect(() => {
    if (mounted && heroes.length > 0 && !selectedHero) {
      const hero = randomHero(heroes);
      setSelectedHero(hero);
      setPerks(getRandomHeroPerks(hero.key));
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
    setPerks(getRandomHeroPerks(hero.key));
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
      setPerks(getRandomHeroPerks(selectedHero.key));
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

  if (!mounted) return null;

  return (
    <div className="unselectable w-full overflow-x-hidden bg-[#2c3e50] text-white min-h-[85vh] mb-4">
      <div className="flex flex-col lg:flex-row w-full">
        {/* Left panel */}
        <div className="w-full lg:w-1/4 flex flex-col px-[3%] text-center">
          <h1 className="text-white">You should play</h1>

          <div
            className="options-toggle"
            onClick={() => setOptionsOpen(!optionsOpen)}
          >
            ⚙ Options {optionsOpen ? "▾" : "▸"}
          </div>
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
                <span className="info-icon" data-tip="Show or hide the full hero portrait image">ⓘ</span>

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
                <span className="info-icon" data-tip="Randomly assign ability perks when picking a hero">ⓘ</span>
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
                <span className="info-icon" data-tip="Prevent the same hero from being picked twice in a row">ⓘ</span>
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
                className="hero-name-animate mx-4 mt-4 mb-0 !text-[2.2rem]"
              >
                {selectedHero.name}
              </h2>
              {showPerks && (
                <div className="mx-4 mb-4" style={{ lineHeight: "0.5em", marginTop: "0.8em" }}>
                  <span
                    key={`perks-${perksCount}`}
                    className="perks-animate text-[1.2rem]"
                  >
                    <span className="text-blue-300">{perks[0]}</span> <span className="text-gray-500">|</span> <span className="text-yellow-300">{perks[1]}</span>
                  </span>
                  <br />
                  <button
                    className="action-button text-[1.2rem] bg-[#0192c7] !px-4 !py-2 !mt-3"
                    onClick={handleNewPerks}
                  >
                    Randomize perks
                  </button>
                </div>
              )}
            </>
          )}

          <div className="random-hero-button btn-orange" onClick={handleRandomHero}>
            Randomize Hero
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-3/4">
          <HeroFilterPanel />
        </div>
      </div>
    </div>
  );
}
