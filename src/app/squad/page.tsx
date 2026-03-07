"use client";

import { useState, useEffect, useCallback } from "react";
import { Hero } from "@/types/hero";
import { useHeroes } from "@/context/HeroContext";
import { randomSquad, randomSquadWithRoles } from "@/lib/heroService";
import HeroFilterPanel from "@/components/HeroFilterPanel";

export default function SquadPage() {
  const { getByRole } = useHeroes();
  const [squad, setSquad] = useState<{
    tanks: Hero[];
    damage: Hero[];
    supports: Hero[];
  }>({ tanks: [], damage: [], supports: [] });
  const [force122, setForce122] = useState(true);
  const [copyText, setCopyText] = useState("Copy to clipboard");
  const [mounted, setMounted] = useState(false);

  const generateSquad = useCallback(() => {
    const heroesByRole = {
      TANK: getByRole("TANK"),
      DAMAGE: getByRole("DAMAGE"),
      SUPPORT: getByRole("SUPPORT"),
    };

    const result = force122
      ? randomSquad(heroesByRole)
      : randomSquadWithRoles(heroesByRole);

    setSquad({
      tanks: result.TANK,
      damage: result.DAMAGE,
      supports: result.SUPPORT,
    });
  }, [getByRole, force122]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      generateSquad();
    }
  }, [mounted, generateSquad]);

  const handleCopy = async () => {
    const allNames = [
      ...squad.tanks.map((h) => h.name),
      ...squad.damage.map((h) => h.name),
      ...squad.supports.map((h) => h.name),
    ];
    const text = allNames.join(" | ");

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
          <h1 className="text-white underline">Team Generator</h1>

          <div className="text-start">
            <div className="text-center text-[1.25rem]">
              <input
                id="checkbox-force122"
                type="checkbox"
                checked={force122}
                onChange={(e) => setForce122(e.target.checked)}
              />
              <label htmlFor="checkbox-force122" className="ml-1">
                Force 1-2-2
              </label>
              <button
                className="inline ml-2 text-white border-none text-[1.2rem] bg-[#0192c7] outline-none px-[0.3em] min-w-[120px] cursor-pointer"
                style={{ transform: "skewX(-10deg)" }}
                onClick={handleCopy}
              >
                {copyText}
              </button>
            </div>

            {/* Tank list */}
            <ul className="list-none pl-0">
              {squad.tanks.map((h) => (
                <li key={h.key} className="flex items-center mb-1">
                  <img
                    className="max-h-[2em]"
                    alt="Tank role icon"
                    src="/assets/imgs/roles/tank.png"
                  />
                  <img
                    className="max-h-[2em] mr-2"
                    alt={`${h.name} icon`}
                    src={`/assets/imgs/heroes/icons/${h.key}.png`}
                  />
                  <span className="text-[2em] align-middle">{h.name}</span>
                </li>
              ))}
            </ul>

            {/* Damage list */}
            <ul className="list-none pl-0">
              {squad.damage.map((h) => (
                <li key={h.key} className="flex items-center mb-1">
                  <img
                    className="max-h-[2em]"
                    alt="Damage role icon"
                    src="/assets/imgs/roles/damage.png"
                  />
                  <img
                    className="max-h-[2em] mr-2"
                    alt={`${h.name} icon`}
                    src={`/assets/imgs/heroes/icons/${h.key}.png`}
                  />
                  <span className="text-[2em] align-middle">{h.name}</span>
                </li>
              ))}
            </ul>

            {/* Support list */}
            <ul className="list-none pl-0">
              {squad.supports.map((h) => (
                <li key={h.key} className="flex items-center mb-1">
                  <img
                    className="max-h-[2em]"
                    alt="Support role icon"
                    src="/assets/imgs/roles/support.png"
                  />
                  <img
                    className="max-h-[2em] mr-2"
                    alt={`${h.name} icon`}
                    src={`/assets/imgs/heroes/icons/${h.key}.png`}
                  />
                  <span className="text-[2em] align-middle">{h.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="random-hero-button" onClick={generateSquad}>
            Get Random Team
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-3/4">
          <HeroFilterPanel
            description='Select the heroes you wish to include in your squad and click in the "Get Random Team" button to get a random team which will include the selected heroes.'
            linkTo="/"
            linkPrefix="Playing solo?"
            linkText="Get a random hero just for you"
          />
        </div>
      </div>
    </div>
  );
}
