"use client";

import { useState } from "react";
import Link from "next/link";
import { ROLES } from "@/data/heroes";
import { SHARED_HERO_ERRORS, type SharedHero } from "@/hooks/useSharedHero";
import RoleSpriteIcon from "@/components/RoleSpriteIcon";
import ShareButton from "@/components/ShareButton";
import SpriteIcon from "@/components/SpriteIcon";
import FeedbackBanner from "./FeedbackBanner";
import SealedCard from "./SealedCard";
import ui from "./ui.module.css";
import styles from "./Shared.module.css";

/**
 * The new design of the page a "Share this roll" link opens. A roll somebody
 * sent arrives sealed: a blank card where the portrait goes, the pool it came
 * from laid out beside it as the line-up of who it could be, and one button
 * to find out. After that it is the picker's rail, rolling from the sender's pool.
 */
export default function SharedHeroRefresh({ shared }: { shared: SharedHero }) {
  // Armed by the Reveal button, so only that turns the card over: not a
  // switch back from the classic design, which shows the result straight away.
  const [unveilArmed, setUnveilArmed] = useState(false);
  if (shared.status === "loading") {
    return <main className={`${ui.page} ${styles.blank}`} />;
  }

  if (shared.status === "invalid") {
    return (
      <main className={`${ui.page} ${styles.blank}`}>
        <div className={styles.problem}>
          <h1 className={styles.problemTitle}>This link didn&apos;t open</h1>
          <p>{SHARED_HERO_ERRORS[shared.reason]}</p>
          <Link className={ui.btn} href="/" prefetch={false}>
            Go to the hero picker
          </Link>
        </div>
      </main>
    );
  }

  const {
    hero,
    perkLabels,
    pool,
    picker,
    ownRoll,
    heroRolls,
    perkRolls,
    handleReroll,
    handleRerollPerks,
  } = shared;

  // Only a roll somebody else made is sealed. A hero this version of the site
  // does not know has nothing to reveal.
  const sealed = !ownRoll && !shared.revealed && hero !== undefined;
  // The first portrait after the reveal turns over; later rolls land.
  const unveiling = unveilArmed && heroRolls === 0;
  // A line-up of just the rolled hero is the answer, so it waits for the
  // reveal too, and so does the link that would open it in the picker.
  const lineupHidden = sealed && pool.length === 1 && pool[0].key === hero.key;
  const roleLabel = hero
    ? (ROLES.find((role) => role.key === hero.role)?.label ?? "")
    : "";
  const perksShown = picker.showPerks && perkLabels !== null;
  const perksSpoken = perksShown
    ? ` Minor perk ${perkLabels.minor}, major perk ${perkLabels.major}.`
    : "";
  const announcement =
    sealed || !hero
      ? ""
      : ownRoll
        ? `Rolled ${hero.name}, ${roleLabel}.${perksSpoken}`
        : `It was ${hero.name}, ${roleLabel}.${perksSpoken}`;

  const groups = ROLES.map((role) => ({
    ...role,
    heroes: pool.filter((candidate) => candidate.role === role.key),
  })).filter((group) => group.heroes.length > 0);

  return (
    <main className={`${ui.page} ${styles.app}`}>
      <section
        className={`${styles.rail} ${picker.showPortrait && hero ? "" : styles.noPortrait}`}
        aria-labelledby="shared-heading"
      >
        <h1 id="shared-heading" className={styles.lead}>
          {ownRoll ? "You should play" : "Someone rolled this for you"}
        </h1>

        {hero ? (
          <>
            {picker.showPortrait && (
              <div className={styles.portraitFrame}>
                {sealed ? (
                  // Not the portrait blurred: a blurred hero is still easy to
                  // tell by its colours and shape, so nothing of it is drawn.
                  <SealedCard className={styles.portrait} />
                ) : (
                  <SpriteIcon
                    key={heroRolls}
                    heroKey={hero.key}
                    type="portrait"
                    className={`${styles.portrait} ${unveiling ? styles.unveil : ""} ${heroRolls > 0 ? ui.land : ""}`}
                    alt={`${hero.name} portrait`}
                  />
                )}
              </div>
            )}

            {sealed ? (
              <>
                <p className={styles.name}>One of {pool.length}</p>
                <div className={styles.role}>Reveal it to see who</div>
              </>
            ) : (
              <>
                <p
                  key={`name-${heroRolls}`}
                  className={`${styles.name} ${ui.land}`}
                >
                  {hero.name}
                </p>
                <div className={styles.role}>
                  <RoleSpriteIcon
                    roleKey={hero.role}
                    alt=""
                    className={ui.roleIcon}
                  />
                  {roleLabel}
                </div>

                {perksShown && (
                  <dl
                    key={`perks-${perkRolls}`}
                    className={`${ui.perks} ${styles.perks} ${ui.land}`}
                  >
                    <div>
                      <dt>Minor perk</dt>
                      <dd>{perkLabels.minor}</dd>
                    </div>
                    <div>
                      <dt>Major perk</dt>
                      <dd>{perkLabels.major}</dd>
                    </div>
                  </dl>
                )}

                <div className={styles.actions}>
                  {perksShown && (
                    <button
                      type="button"
                      className={ui.btn}
                      onClick={handleRerollPerks}
                    >
                      Reroll perks
                    </button>
                  )}
                  <ShareButton
                    className={ui.btn}
                    buildUrl={shared.buildResultUrl}
                    shareType="hero_result"
                    shareSource="shared_hero"
                    label="Share this roll"
                    copiedLabel="Roll link copied"
                    title="Copy a link that reveals this hero"
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <p className={styles.unknown}>
            This link points at a hero this version of the site doesn&apos;t
            know. Roll again to get one.
          </p>
        )}

        <div className={ui.rollBar} data-roll-bar>
          {sealed ? (
            <button
              type="button"
              className={ui.roll}
              onClick={() => {
                setUnveilArmed(true);
                shared.reveal();
              }}
            >
              Reveal the hero
            </button>
          ) : (
            <button type="button" className={ui.roll} onClick={handleReroll}>
              Roll again
            </button>
          )}
        </div>

        {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- announces the reveal and each roll, not the result of a form */}
        <p className={ui.vh} role="status">
          <span key={`${heroRolls}-${perkRolls}`}>{announcement}</span>
        </p>
      </section>

      <section className={styles.side} aria-labelledby="shared-pool-heading">
        <FeedbackBanner />
        <div className={styles.head}>
          <div className={styles.headText}>
            <h2 id="shared-pool-heading" className={styles.title}>
              {lineupHidden
                ? "It is the only one selected"
                : sealed
                  ? "It is one of these"
                  : "The heroes it came from"}
            </h2>
            <p className={styles.summary}>
              {shared.everyHero
                ? `It could have been any hero, all ${pool.length} of them.`
                : `${pool.length} ${pool.length === 1 ? "hero was" : "heroes were"} selected.`}
              {picker.nonRepeating
                ? " Rolling again never gives the same hero twice in a row."
                : ""}
            </p>
          </div>
          {/* A full page load, not a client navigation: the picker reads a
              shared pool once, as it starts. */}
          {!lineupHidden && (
            <a
              className={ui.btn}
              href={shared.presetHref}
              title="Open the picker with these heroes selected and these roll settings"
            >
              Open this selection in the picker
            </a>
          )}
          <Link className={ui.btn} href="/" prefetch={false}>
            Use your own selection
          </Link>
        </div>

        {lineupHidden ? (
          <p className={styles.summary}>
            With only one hero to pick from, the selection would give it away,
            so it stays hidden until the reveal too.
          </p>
        ) : (
          groups.map((group) => (
            <section
              key={group.key}
              className={styles.group}
              aria-label={group.label}
            >
              <h3 className={styles.groupTitle}>
                <RoleSpriteIcon
                  roleKey={group.key}
                  alt=""
                  className={`${ui.roleIcon} ${styles.groupIcon}`}
                />
                {group.label}
                <span className={styles.count}>{group.heroes.length}</span>
              </h3>
              <ul className={styles.lineup}>
                {group.heroes.map((candidate) => {
                  const rolled = !sealed && candidate.key === hero?.key;
                  return (
                    <li
                      key={candidate.key}
                      className={`${styles.suspect} ${rolled ? styles.rolled : ""}`}
                    >
                      <SpriteIcon
                        heroKey={candidate.key}
                        type="icon"
                        alt=""
                        className={styles.suspectIcon}
                      />
                      <span className={styles.suspectName}>
                        {candidate.name}
                      </span>
                      {rolled && <span className={ui.vh}>, the roll</span>}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </section>
    </main>
  );
}
