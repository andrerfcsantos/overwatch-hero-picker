"use client";

import { useId, useRef, useState } from "react";
import { Hero, HeroRole } from "@/types/hero";
import { ROLES, getAllHeroes } from "@/data/heroes";
import RoleSpriteIcon from "@/components/RoleSpriteIcon";
import SpriteIcon from "@/components/SpriteIcon";
import PoolEditor from "./PoolEditor";
import { useResultIntoView } from "./scroll";
import ui from "./ui.module.css";
import styles from "./SquadSlotRefresh.module.css";

const ALL_HEROES = getAllHeroes();

interface SquadSlotRefreshProps {
  index: number;
  hero: Hero | null;
  name: string;
  /** Heroes this player will not be given. */
  disabledHeroes: Set<string>;
  /** Null when perks are off, or the hero has none. */
  perks: { minor: string; major: string } | null;
  onNameChange: (index: number, name: string) => void;
  onDisabledChange: (index: number, disabled: Set<string>) => void;
  onResetFilters: (index: number) => void;
  onReroll: (index: number) => void;
}

/**
 * One player's row: who they are, what they rolled, and the pool they roll
 * from. The pool opens in place and is the same roster the picker uses.
 */
export default function SquadSlotRefresh({
  index,
  hero,
  name,
  disabledHeroes,
  perks,
  onNameChange,
  onDisabledChange,
  onResetFilters,
  onReroll,
}: SquadSlotRefreshProps) {
  const [poolOpen, setPoolOpen] = useState(false);
  const poolId = useId();
  // A reroll from the button below the result, on a phone scrolled so the
  // button is near the top, changes the hero above the screen.
  const row = useRef<HTMLDivElement>(null);
  const [rerolls, setRerolls] = useState(0);
  useResultIntoView(row, rerolls, { ownRow: true });

  const player = name.trim() || `Player ${index + 1}`;
  const total = ALL_HEROES.length;
  // Counted against the heroes that exist, so a key left over from a hero that
  // has since been removed cannot push the count below what is on screen.
  const inCount = ALL_HEROES.filter(
    (candidate) => !disabledHeroes.has(candidate.key),
  ).length;
  const poolLabel = `Selected: ${inCount === total ? `all ${total}` : `${inCount} of ${total}`}`;
  const roleLabel = hero
    ? (ROLES.find((role) => role.key === hero.role)?.label ?? "")
    : "";

  const toggleHero = (heroKey: string) => {
    const next = new Set(disabledHeroes);
    if (next.has(heroKey)) next.delete(heroKey);
    else next.add(heroKey);
    onDisabledChange(index, next);
  };

  const setRole = (role: HeroRole, inPool: boolean) => {
    const next = new Set(disabledHeroes);
    for (const candidate of ALL_HEROES) {
      if (candidate.role !== role) continue;
      if (inPool) next.delete(candidate.key);
      else next.add(candidate.key);
    }
    onDisabledChange(index, next);
  };

  const onlyRole = (role: HeroRole) => {
    onDisabledChange(
      index,
      new Set(
        ALL_HEROES.filter((candidate) => candidate.role !== role).map(
          (candidate) => candidate.key,
        ),
      ),
    );
  };

  return (
    <li className={styles.slot}>
      <div ref={row} className={styles.row}>
        {hero ? (
          <SpriteIcon
            heroKey={hero.key}
            type="icon"
            alt=""
            className={styles.face}
          />
        ) : (
          <span className={`${styles.face} ${styles.faceEmpty}`} />
        )}

        <div className={styles.who} data-result>
          <input
            className={styles.nameInput}
            type="text"
            placeholder={`Player ${index + 1}`}
            aria-label={`Name of player ${index + 1}`}
            value={name}
            onChange={(e) => onNameChange(index, e.target.value)}
          />
          {hero ? (
            <div className={styles.result}>
              <span key={hero.key} className={`${styles.heroName} ${ui.land}`}>
                {hero.name}
              </span>
              <span className={styles.role}>
                <RoleSpriteIcon
                  roleKey={hero.role}
                  alt=""
                  className={ui.roleIcon}
                />
                {roleLabel}
              </span>
            </div>
          ) : (
            <p className={styles.none}>No hero left to give this player.</p>
          )}
        </div>

        {perks && (
          <dl className={`${ui.perks} ${styles.perks}`}>
            <div>
              <dt>Minor perk</dt>
              <dd>{perks.minor}</dd>
            </div>
            <div>
              <dt>Major perk</dt>
              <dd>{perks.major}</dd>
            </div>
          </dl>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={ui.btn}
            aria-label={`Reroll ${player}`}
            data-roll-source
            onClick={() => {
              onReroll(index);
              setRerolls((count) => count + 1);
            }}
          >
            Reroll
          </button>
          <button
            type="button"
            className={`${ui.btn} ${ui.caret}`}
            aria-expanded={poolOpen}
            aria-controls={poolId}
            // Starts with the words on the button, so asking for it by what
            // it says finds it.
            aria-label={`${poolLabel}, ${player}`}
            onClick={() => setPoolOpen(!poolOpen)}
          >
            {poolLabel}
          </button>
        </div>
      </div>

      {poolOpen && (
        <div id={poolId} className={styles.pool}>
          <div className={styles.poolHead}>
            <span>
              {inCount === 0
                ? `No heroes are selected for ${player}, so they can be given any hero.`
                : `${player} can be given ${inCount === total ? `any of the ${total} heroes` : `${inCount} of ${total} heroes`}.`}
            </span>
            {inCount < total && (
              <button
                type="button"
                className={ui.link}
                onClick={() => onResetFilters(index)}
              >
                Select all
              </button>
            )}
          </div>
          <PoolEditor
            compact
            label={player}
            isIn={(heroKey) => !disabledHeroes.has(heroKey)}
            onToggleHero={toggleHero}
            onSetRole={setRole}
            onOnlyRole={onlyRole}
            currentHeroKey={hero?.key ?? null}
          />
        </div>
      )}
    </li>
  );
}
