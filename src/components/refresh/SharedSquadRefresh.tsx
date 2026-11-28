"use client";

import { useState } from "react";
import Link from "next/link";
import { ROLES, getAllHeroes } from "@/data/heroes";
import { SHARED_SQUAD_ERRORS, type SharedSquad } from "@/hooks/useSharedSquad";
import { perksFromIndices } from "@/lib/heroService";
import RoleSpriteIcon from "@/components/RoleSpriteIcon";
import ShareButton from "@/components/ShareButton";
import SpriteIcon from "@/components/SpriteIcon";
import FeedbackBanner from "./FeedbackBanner";
import SealedCard from "./SealedCard";
import ui from "./ui.module.css";
import styles from "./Shared.module.css";

const heroByKey = new Map(getAllHeroes().map((hero) => [hero.key, hero]));

/**
 * The new design of the page a "Share this squad" link opens. A squad
 * somebody sent arrives sealed, one row per player with a blank card where the
 * hero goes, and one button turns them over in order.
 */
export default function SharedSquadRefresh({
  shared,
}: {
  shared: SharedSquad;
}) {
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
          <p>{SHARED_SQUAD_ERRORS[shared.reason]}</p>
          <Link className={ui.btn} href="/squad" prefetch={false}>
            Go to the squad generator
          </Link>
        </div>
      </main>
    );
  }

  const { squad, heroes, perks, ownRoll, rolls, handleReroll } = shared;
  const sealed = !ownRoll && !shared.revealed;
  // The first faces after the reveal turn over; later rolls just swap them.
  const unveiling = unveilArmed && rolls === 0;

  const players = Array.from({ length: squad.size }, (_, index) => {
    const heroKey = heroes[index] ?? null;
    const hero = heroKey ? heroByKey.get(heroKey) : undefined;
    return {
      index,
      name: squad.names[index]?.trim() || `Player ${index + 1}`,
      hero,
      roleLabel: hero
        ? (ROLES.find((role) => role.key === hero.role)?.label ?? "")
        : "",
      perks:
        squad.randomizePerks && heroKey
          ? perksFromIndices(heroKey, perks[index] ?? null)
          : null,
    };
  });

  const facts = [
    squad.size === 1 ? "1 player" : `${squad.size} players`,
    squad.force122 && squad.size === 5
      ? "Kept to 1 tank, 2 damage, 2 supports"
      : squad.force222 && squad.size === 6
        ? "Kept to 2 tanks, 2 damage, 2 supports"
        : null,
    squad.randomizePerks ? "Perks rolled with the heroes" : null,
    squad.slots.slice(0, squad.size).some((slot) => slot !== null)
      ? "Some players roll from their own selection"
      : null,
  ].filter((fact): fact is string => fact !== null);

  const announcement = sealed
    ? ""
    : `Squad: ${players.map((player) => `${player.name}, ${player.hero?.name ?? "nobody"}`).join("; ")}.`;

  return (
    <main className={`${ui.page} ${styles.app}`}>
      <section className={styles.squadRail} aria-labelledby="shared-heading">
        <h1 id="shared-heading" className={styles.title}>
          {ownRoll ? "Your squad" : "Someone rolled this squad for you"}
        </h1>

        <ul className={styles.facts}>
          {facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>

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
              Reveal the squad
            </button>
          ) : (
            <button type="button" className={ui.roll} onClick={handleReroll}>
              Roll the squad again
            </button>
          )}
        </div>

        <div className={styles.railActions}>
          {!sealed && (
            <ShareButton
              className={ui.btn}
              buildUrl={shared.buildResultUrl}
              shareType="squad_result"
              shareSource="shared_squad"
              label="Share this squad"
              copiedLabel="Squad link copied"
              title="Copy a link that reveals this squad"
            />
          )}
          {/* Full page load so the squad generator reads the setup as it starts.
              Not while sealed: a player with one hero to pick from would get
              it again there. */}
          {!sealed && (
            <a
              className={ui.btn}
              href={shared.presetHref}
              title="Open the squad generator with these players, selections and settings"
            >
              Open this setup in the generator
            </a>
          )}
          <Link className={ui.btn} href="/squad" prefetch={false}>
            Set up your own squad
          </Link>
        </div>

        {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- announces the reveal and each roll, not the result of a form */}
        <p className={ui.vh} role="status">
          <span key={rolls}>{announcement}</span>
        </p>
      </section>

      <section className={styles.side} aria-labelledby="shared-squad-heading">
        <FeedbackBanner />
        <h2 id="shared-squad-heading" className={styles.title}>
          {sealed ? "Who got whom" : "The squad"}
        </h2>

        <ol
          className={`${styles.players} ${rolls === 0 ? styles.inOrder : ""} ${unveiling ? styles.revealing : ""}`}
        >
          {players.map((player) => (
            <li
              key={player.index}
              className={styles.player}
              style={{ "--i": player.index } as React.CSSProperties}
            >
              {/* Every sealed player gets the same card, even one left without
                  a hero, so the cards say nothing until the reveal. */}
              <span className={styles.faceFrame}>
                {sealed ? (
                  <SealedCard className={styles.face} />
                ) : (
                  <>
                    {/* No hero left: the empty frame is the face that turns in. */}
                    {!player.hero && (
                      <span
                        className={`${styles.face} ${styles.faceEmpty} ${unveiling ? styles.unveil : ""}`}
                      />
                    )}
                    {player.hero && (
                      <SpriteIcon
                        heroKey={player.hero.key}
                        type="icon"
                        alt=""
                        className={`${styles.face} ${unveiling ? styles.unveil : ""}`}
                      />
                    )}
                    {/* The card stays a moment to turn away first. */}
                    {unveiling && (
                      <SealedCard
                        className={`${styles.face} ${styles.cardOut}`}
                      />
                    )}
                  </>
                )}
              </span>

              <div className={styles.who}>
                <span className={styles.playerName}>{player.name}</span>
                {sealed ? (
                  <span className={styles.redacted}>
                    <span className={ui.vh}>Hidden until revealed</span>
                  </span>
                ) : player.hero ? (
                  <span className={styles.result}>
                    <span
                      key={`${player.hero.key}-${rolls}`}
                      className={`${styles.heroName} ${ui.land}`}
                    >
                      {player.hero.name}
                    </span>
                    <span className={styles.role}>
                      <RoleSpriteIcon
                        roleKey={player.hero.role}
                        alt=""
                        className={ui.roleIcon}
                      />
                      {player.roleLabel}
                    </span>
                  </span>
                ) : (
                  <span className={styles.none}>
                    No hero left to give this player.
                  </span>
                )}
              </div>

              {!sealed && player.perks && (
                <dl className={`${ui.perks} ${styles.playerPerks}`}>
                  <div>
                    <dt>Minor perk</dt>
                    <dd>{player.perks.minor}</dd>
                  </div>
                  <div>
                    <dt>Major perk</dt>
                    <dd>{player.perks.major}</dd>
                  </div>
                </dl>
              )}

              {!sealed && (
                <button
                  type="button"
                  className={`${ui.btn} ${styles.playerReroll}`}
                  aria-label={`Reroll ${player.name}`}
                  onClick={() => shared.handleRerollSlot(player.index)}
                >
                  Reroll
                </button>
              )}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
