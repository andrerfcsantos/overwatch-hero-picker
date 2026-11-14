"use client";

import { useEffect, useRef, useState } from "react";
import type { Picker } from "@/hooks/usePicker";
import HeroFilterPanel from "@/components/HeroFilterPanel";
import ShareButton from "@/components/ShareButton";
import SharedPresetNotice from "@/components/SharedPresetNotice";
import SpriteIcon from "@/components/SpriteIcon";
import RoleSpriteIcon from "@/components/RoleSpriteIcon";

/** The classic design of the random hero page. Its behaviour is `usePicker`. */
export default function PickerContent({ picker }: { picker: Picker }) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const portraitRef = useRef<HTMLDivElement>(null);
  const {
    selectedHero,
    perkLabels,
    heroCount,
    perksCount,
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

  // Re-trigger portrait animation without remounting. Skipped for the opening
  // hero, whose element already plays it on mount.
  useEffect(() => {
    if (heroCount === 0 || !portraitRef.current) return;
    portraitRef.current.classList.remove("hero-portrait-animate");
    void portraitRef.current.offsetWidth;
    portraitRef.current.classList.add("hero-portrait-animate");
  }, [heroCount]);

  return (
    <div className="w-full overflow-x-hidden bg-[#2c3e50] text-white min-h-[85vh] mb-4">
      {sharedPresetApplied && (
        <div className="px-[3%] pt-2">
          <SharedPresetNotice
            message="Filters and options from a shared link have been applied, replacing your own."
            onUndo={handleUndoShared}
            onDismiss={handleDismissShared}
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

          {selectedHero && (
            <div className="result-card">
              {showPortrait && (
                <SpriteIcon
                  ref={portraitRef}
                  heroKey={selectedHero.key}
                  type="portrait"
                  className="hero-portrait mx-auto hero-portrait-animate"
                  alt={`${selectedHero.name} portrait`}
                />
              )}

              <h2
                key={`hero-name-${heroCount}`}
                className="hero-name-animate result-hero-name"
              >
                <RoleSpriteIcon
                  roleKey={selectedHero.role}
                  alt={selectedHero.role}
                  className="w-8 h-8"
                />
                {selectedHero.name}
              </h2>

              {showPerks && perkLabels && (
                <span
                  key={`perks-${perksCount}`}
                  className="perks-animate result-perks"
                >
                  <span className="text-blue-300">{perkLabels.minor}</span>{" "}
                  <span className="text-gray-500">|</span>{" "}
                  <span className="text-yellow-300">{perkLabels.major}</span>
                </span>
              )}

              <div className="result-actions">
                {showPerks && perkLabels && (
                  <button
                    className="action-button btn-perks"
                    onClick={handleNewPerks}
                  >
                    ↻ Randomize perks
                  </button>
                )}
                <ShareButton
                  className="action-button btn-share"
                  buildUrl={buildResultUrl}
                  shareType="hero_result"
                  shareSource="picker"
                  label="Share this roll"
                  title="Copy a link that reveals this hero"
                />
              </div>
            </div>
          )}

          <button
            className="random-hero-button btn-orange"
            onClick={handleRandomHero}
          >
            Randomize Hero
          </button>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-3/4">
          <HeroFilterPanel
            buildPresetUrl={buildPresetUrl}
            buildOverlayUrl={buildOverlayUrl}
          />
        </div>
      </div>
    </div>
  );
}
