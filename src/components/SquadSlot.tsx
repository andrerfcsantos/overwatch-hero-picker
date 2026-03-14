"use client";

import { useRef, useEffect } from "react";
import { Hero, HeroRole } from "@/types/hero";
import { getAllHeroes, getHeroesByRole, ROLES } from "@/data/heroes";
import SpriteIcon from "@/components/SpriteIcon";
import styles from "./SquadSlot.module.css";

interface SquadSlotProps {
  index: number;
  hero: Hero | null;
  name: string;
  disabledHeroes: Set<string>;
  perks: { minor: string; major: string } | null;
  showPerks: boolean;
  onNameChange: (index: number, name: string) => void;
  onDisabledChange: (index: number, disabled: Set<string>) => void;
  onReroll: (index: number) => void;
}

export default function SquadSlot({
  index,
  hero,
  name,
  disabledHeroes,
  perks,
  showPerks,
  onNameChange,
  onDisabledChange,
  onReroll,
}: SquadSlotProps) {
  const roleCheckboxRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const allHeroes = getAllHeroes();

  // Update indeterminate state on role checkboxes
  useEffect(() => {
    for (const { key } of ROLES) {
      const roleHeroes = getHeroesByRole(key);
      const disabledCount = roleHeroes.filter((h) =>
        disabledHeroes.has(h.key),
      ).length;
      const ref = roleCheckboxRefs.current[key];
      if (ref) {
        ref.indeterminate =
          disabledCount > 0 && disabledCount < roleHeroes.length;
      }
    }
  }, [disabledHeroes]);

  function toggleHero(heroKey: string) {
    const next = new Set(disabledHeroes);
    if (next.has(heroKey)) {
      next.delete(heroKey);
    } else {
      next.add(heroKey);
    }
    onDisabledChange(index, next);
  }

  function toggleRole(role: HeroRole) {
    const roleHeroes = getHeroesByRole(role);
    const allDisabled = roleHeroes.every((h) => disabledHeroes.has(h.key));
    const next = new Set(disabledHeroes);
    if (allDisabled) {
      // Enable all in role
      for (const h of roleHeroes) next.delete(h.key);
    } else {
      // Disable all in role
      for (const h of roleHeroes) next.add(h.key);
    }
    onDisabledChange(index, next);
  }

  return (
    <div className={styles.slot}>
      <input
        className={styles.nameInput}
        type="text"
        placeholder={`Player ${index + 1}`}
        value={name}
        onChange={(e) => onNameChange(index, e.target.value)}
      />

      {hero ? (
        <>
          <div className={styles.heroRow}>
            <SpriteIcon
              className={styles.heroIcon}
              heroKey={hero.key}
              type="icon"
              alt={`${hero.name} icon`}
            />
            <span className={styles.heroName}>{hero.name}</span>
            <button
              className={styles.rerollBtn}
              onClick={() => onReroll(index)}
              title="Reroll this slot"
            >
              ↻
            </button>
          </div>
          {showPerks && perks && (
            <div className={styles.perks}>
              <span className={styles.perkMinor}>{perks.minor}</span>
              <span className={styles.perkSep}>|</span>
              <span className={styles.perkMajor}>{perks.major}</span>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptySlot}>—</div>
      )}

      <details className={styles.filterDetails}>
        <summary className={styles.filterSummary}>
          ▸ Filters ({allHeroes.length - disabledHeroes.size})
        </summary>
        <div className={styles.filterContent}>
          {ROLES.map(({ key, label, icon }) => {
            const roleHeroes = getHeroesByRole(key);
            const allDisabled = roleHeroes.every((h) =>
              disabledHeroes.has(h.key),
            );
            return (
              <div key={key} className={styles.roleSection}>
                <label className={styles.roleHeader}>
                  <input
                    ref={(el) => { roleCheckboxRefs.current[key] = el; }}
                    type="checkbox"
                    checked={!allDisabled}
                    onChange={() => toggleRole(key)}
                  />
                  <img
                    className={styles.roleIcon}
                    src={icon}
                    alt={`${label} icon`}
                  />
                  <span className={styles.roleLabel}>{label}</span>
                </label>
                {roleHeroes.map((h) => (
                  <label key={h.key} className={styles.heroCheckRow}>
                    <input
                      type="checkbox"
                      checked={!disabledHeroes.has(h.key)}
                      onChange={() => toggleHero(h.key)}
                    />
                    <SpriteIcon
                      className={styles.heroCheckIcon}
                      heroKey={h.key}
                      type="icon"
                      alt={`${h.name} icon`}
                    />
                    <span className={styles.heroCheckLabel}>{h.name}</span>
                  </label>
                ))}
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}
