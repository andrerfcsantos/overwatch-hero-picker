"use client";

import { HeroRole } from "@/types/hero";
import { ROLES, getHeroesByRole } from "@/data/heroes";
import RoleSpriteIcon from "@/components/RoleSpriteIcon";
import SpriteIcon from "@/components/SpriteIcon";
import ui from "./ui.module.css";
import styles from "./PoolEditor.module.css";

/** What "Only …" says for each role. */
const ONLY_LABEL: Record<HeroRole, string> = {
  TANK: "Only tanks",
  DAMAGE: "Only damage",
  SUPPORT: "Only supports",
};

const ROLE_GROUPS = ROLES.map((role) => ({
  ...role,
  heroes: getHeroesByRole(role.key),
}));

interface PoolEditorProps {
  /** Whether a hero is in the pool being edited. */
  isIn: (heroKey: string) => boolean;
  onToggleHero: (heroKey: string) => void;
  /** Puts a whole role in the pool, or takes it out. */
  onSetRole: (role: HeroRole, inPool: boolean) => void;
  /** Makes the pool exactly one role. */
  onOnlyRole: (role: HeroRole) => void;
  /** Marked in the grid, so the roll and the roster visibly agree. */
  currentHeroKey?: string | null;
  /** Says what the pool is for, read out with each role ("Player 2, Tank"). */
  label?: string;
  /** Tighter spacing, for a pool edited inside something else. */
  compact?: boolean;
  /**
   * For a roster that has a page's width to itself: where there is room, each
   * role's name and its controls stand beside its heroes instead of above
   * them, which is three rows the page gets back.
   */
  rail?: boolean;
}

/**
 * The roster, grouped by role. A hero in the pool is a plain tile; one left
 * out is hollow. A full pool, the usual case, is therefore the calmest thing
 * the grid can show, and the exceptions are what the eye lands on.
 *
 * Used for the picker's pool and for each squad slot's, so the two cannot
 * drift apart.
 */
export default function PoolEditor({
  isIn,
  onToggleHero,
  onSetRole,
  onOnlyRole,
  currentHeroKey = null,
  label,
  compact = false,
  rail = false,
}: PoolEditorProps) {
  return (
    <div
      className={`${compact ? styles.compact : ""} ${rail ? styles.rail : ""}`}
    >
      {ROLE_GROUPS.map(({ key, label: roleLabel, heroes }) => {
        const inCount = heroes.filter((hero) => isIn(hero.key)).length;
        const all = inCount === heroes.length;
        return (
          <section
            key={key}
            className={styles.group}
            aria-label={label ? `${label}, ${roleLabel}` : roleLabel}
          >
            <div className={styles.groupHead}>
              <label className={styles.roleCheck}>
                <input
                  type="checkbox"
                  className={ui.check}
                  checked={all}
                  ref={(input) => {
                    if (input) input.indeterminate = inCount > 0 && !all;
                  }}
                  // A partly filled role fills up first, as a tri-state
                  // checkbox is expected to.
                  onChange={() => onSetRole(key, !all)}
                />
                <RoleSpriteIcon
                  roleKey={key}
                  alt=""
                  className={`${ui.roleIcon} ${styles.groupIcon}`}
                />
                {roleLabel}
              </label>
              <span className={styles.count}>
                {inCount} of {heroes.length}
              </span>
              <button
                type="button"
                className={`${ui.link} ${styles.only}`}
                onClick={() => onOnlyRole(key)}
              >
                {ONLY_LABEL[key]}
              </button>
            </div>
            <ul className={styles.tiles}>
              {heroes.map((hero) => {
                const inPool = isIn(hero.key);
                return (
                  <li key={hero.key}>
                    <button
                      type="button"
                      className={`${styles.hero} ${hero.key === currentHeroKey ? styles.current : ""}`}
                      aria-pressed={inPool}
                      onClick={() => onToggleHero(hero.key)}
                    >
                      <SpriteIcon
                        heroKey={hero.key}
                        type="icon"
                        alt=""
                        className={styles.heroIcon}
                      />
                      <span className={styles.heroName}>{hero.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
