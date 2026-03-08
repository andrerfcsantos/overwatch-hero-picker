"use client";

import { useState, useEffect, useCallback } from "react";
import { Hero } from "@/types/hero";
import { useHeroes } from "@/context/HeroContext";
import { randomSquad, randomSquadWithRoles } from "@/lib/heroService";
import { heroPerks } from "@/data/heroPerks";
import HeroFilterPanel from "@/components/HeroFilterPanel";

export default function SquadPage() {
  const { getByRole } = useHeroes();
  const [squad, setSquad] = useState<{
    tanks: Hero[];
    damage: Hero[];
    supports: Hero[];
  }>({ tanks: [], damage: [], supports: [] });
  const [force122, setForce122] = useState(true);
  const [randomizePerks, setRandomizePerks] = useState(true);
  const [perkAssignments, setPerkAssignments] = useState<
    Record<string, { minor: string; major: string }>
  >({});
  const [copyText, setCopyText] = useState("Copy to clipboard");
  const [mounted, setMounted] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const assignPerks = useCallback((heroes: Hero[]) => {
    const assignments: Record<string, { minor: string; major: string }> = {};
    for (const hero of heroes) {
      const perks = heroPerks[hero.key];
      if (perks) {
        assignments[hero.key] = {
          minor: perks.minor[Math.floor(Math.random() * perks.minor.length)],
          major: perks.major[Math.floor(Math.random() * perks.major.length)],
        };
      }
    }
    return assignments;
  }, []);

  const generateSquad = useCallback(() => {
    const heroesByRole = {
      TANK: getByRole("TANK"),
      DAMAGE: getByRole("DAMAGE"),
      SUPPORT: getByRole("SUPPORT"),
    };

    const result = force122
      ? randomSquad(heroesByRole)
      : randomSquadWithRoles(heroesByRole);

    const allHeroes = [...result.TANK, ...result.DAMAGE, ...result.SUPPORT];
    setPerkAssignments(assignPerks(allHeroes));

    setSquad({
      tanks: result.TANK,
      damage: result.DAMAGE,
      supports: result.SUPPORT,
    });
  }, [getByRole, force122, assignPerks]);

  useEffect(() => {
    setMounted(true);
    generateSquad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = async () => {
    const allHeroes = [...squad.tanks, ...squad.damage, ...squad.supports];
    const text = allHeroes
      .map((h) => {
        const perks = perkAssignments[h.key];
        if (randomizePerks && perks) {
          return `${h.name} (${perks.minor}, ${perks.major})`;
        }
        return h.name;
      })
      .join(" | ");

    try {
      await navigator.clipboard.writeText(text);
      setCopyText("Copied!");
    } catch {
      setCopyText("Error copying :(");
    }

    setTimeout(() => setCopyText("Copy to clipboard"), 1500);
  };

  if (!mounted) return null;

  return (
    <div className="unselectable w-full overflow-x-hidden bg-[#2c3e50] text-white min-h-[85vh]">
      <div className="flex flex-col lg:flex-row w-full">
        {/* Left panel */}
        <div className="w-full lg:w-1/4 flex flex-col px-[3%] text-center">
          <h1 className="text-white">Team Generator</h1>

          <div
            className="options-toggle"
            onClick={() => setOptionsOpen(!optionsOpen)}
          >
            ⚙ Options {optionsOpen ? "▾" : "▸"}
          </div>
          {optionsOpen && (
            <>
              <div className="text-center text-[1.25rem] mb-2">
                <input
                  id="checkbox-force122"
                  type="checkbox"
                  checked={force122}
                  onChange={(e) => setForce122(e.target.checked)}
                />
                <label htmlFor="checkbox-force122" className="ml-1 mr-1">
                  Force 1-2-2
                </label>
                <span className="info-icon" data-tip="Force team composition to 1 Tank, 2 Damage, 2 Support">ⓘ</span>
              </div>
              <div className="text-center text-[1.25rem] mb-2">
                <input
                  id="checkbox-perks"
                  type="checkbox"
                  checked={randomizePerks}
                  onChange={(e) => setRandomizePerks(e.target.checked)}
                />
                <label htmlFor="checkbox-perks" className="ml-1 mr-1">
                  Randomize Perks
                </label>
                <span className="info-icon" data-tip="Assign a random minor and major perk to each hero">ⓘ</span>
              </div>
            </>
          )}

          <button
            className="action-button text-[1.2rem] bg-[#0192c7] mb-3 max-w-[14rem] self-center"
            onClick={handleCopy}
          >
            {copyText}
          </button>

          <div className="text-center">

            <div className="squad-hero-list">
              {[
                { heroes: squad.tanks, role: "tank", label: "Tank" },
                { heroes: squad.damage, role: "damage", label: "Damage" },
                { heroes: squad.supports, role: "support", label: "Support" },
              ].map(({ heroes, role, label }) =>
                heroes.map((h) => (
                  <div key={h.key}>
                    <div className="squad-hero-row">
                      <img
                        className="squad-role-icon"
                        alt={`${label} role icon`}
                        src={`/assets/imgs/roles/${role}.png`}
                      />
                      <img
                        className="squad-hero-icon"
                        alt={`${h.name} icon`}
                        src={`/assets/imgs/heroes/icons/${h.key}.png`}
                      />
                      <span className="squad-hero-name">{h.name}</span>
                    </div>
                    {randomizePerks && perkAssignments[h.key] && (
                      <div className="flex justify-center text-[1rem] mb-1 opacity-80 gap-1">
                        <span className="text-blue-300">
                          {perkAssignments[h.key].minor}
                        </span>
                        <span className="text-gray-500">|</span>
                        <span className="text-yellow-300">
                          {perkAssignments[h.key].major}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="random-hero-button btn-orange mt-4" onClick={generateSquad}>
            Randomize Squad
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
