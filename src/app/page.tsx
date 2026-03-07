"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Hero } from "@/types/hero";
import { useHeroes } from "@/context/HeroContext";
import { randomHero, getRandomHeroPerks } from "@/lib/heroService";
import { getBoolFromLS, setBoolToLS } from "@/lib/localStorage";
import HeroFilterPanel from "@/components/HeroFilterPanel";

export default function PickerPage() {
  const { heroes, getSelected } = useHeroes();

  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [perks, setPerks] = useState<[string, string]>(["", ""]);
  const [heroCount, setHeroCount] = useState(0);
  const [showPortrait, setShowPortrait] = useState(true);
  const [showPerks, setShowPerks] = useState(true);
  const [nonRepeatingMode, setNonRepeatingMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const portraitRef = useRef<HTMLImageElement>(null);

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
    <div className="unselectable w-full overflow-x-hidden bg-[#2c3e50] text-white min-h-[85vh] mb-20">
      <div className="flex flex-col lg:flex-row w-full">
        {/* Left panel */}
        <div className="w-full lg:w-1/4 flex flex-col px-[3%] text-center">
          <h1 className="text-white underline">You should play</h1>

          <div>
            <div>
              <input
                id="checkbox-show-portrait"
                type="checkbox"
                checked={showPortrait}
                onChange={(e) => handleShowPortrait(e.target.checked)}
              />
              <label htmlFor="checkbox-show-portrait" className="ml-1 mr-2.5">
                Show hero portrait
              </label>

              <input
                id="checkbox-show-perks"
                type="checkbox"
                checked={showPerks}
                onChange={(e) => handleShowPerks(e.target.checked)}
              />
              <label htmlFor="checkbox-show-perks" className="ml-1">
                Randomize perks
              </label>
            </div>

            <div>
              <input
                id="checkbox-non-repeating"
                type="checkbox"
                checked={nonRepeatingMode}
                onChange={(e) => handleNonRepeating(e.target.checked)}
              />
              <label htmlFor="checkbox-non-repeating" className="ml-1">
                Non-repeating mode
              </label>
            </div>
          </div>

          {showPortrait && selectedHero && (
            <img
              ref={portraitRef}
              src={`/assets/imgs/heroes/portraits/${selectedHero.key}.png`}
              className="max-w-[75%] mx-auto hero-portrait-animate"
              alt={`${selectedHero.name} portrait`}
            />
          )}

          {selectedHero && (
            <h2
              key={`hero-name-${heroCount}`}
              className="hero-name-animate mx-4 my-4"
            >
              {selectedHero.name}
              {showPerks && (
                <div style={{ lineHeight: "0.5em" }}>
                  <span style={{ fontSize: "0.6em" }}>
                    {perks[0]} | {perks[1]}
                  </span>
                  <br />
                  <span
                    className="text-base text-[rgb(240,100,20)] underline cursor-pointer"
                    onClick={handleNewPerks}
                  >
                    New perks
                  </span>
                </div>
              )}
            </h2>
          )}

          <div className="random-hero-button" onClick={handleRandomHero}>
            Get Random Hero
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-3/4">
          <HeroFilterPanel
            description='Select the heroes you wish to play and click in the "Get Random Hero" button to get a random hero from the selected ones.'
            linkTo="/squad"
            linkPrefix="Playing as a group?"
            linkText="Get random heroes for your team"
          />
        </div>
      </div>
    </div>
  );
}
