"use client";

import Link from "next/link";
import { getAllHeroes } from "@/data/heroes";
import { useDesign } from "@/context/DesignContext";
import {
  SHARED_SQUAD_ERRORS,
  type SharedSquad,
  useSharedSquad,
} from "@/hooks/useSharedSquad";
import { perksFromIndices } from "@/lib/heroService";
import { SquadPreset } from "@/lib/share/types";
import SharedSquadRefresh from "./refresh/SharedSquadRefresh";
import RoleSpriteIcon from "./RoleSpriteIcon";
import ShareButton from "./ShareButton";
import SpriteIcon from "./SpriteIcon";
import styles from "./SharedContent.module.css";

const heroByKey = new Map(getAllHeroes().map((hero) => [hero.key, hero]));

function compositionLabel(squad: SquadPreset): string | null {
  if (squad.force122 && squad.size === 5) return "1-2-2 enforced";
  if (squad.force222 && squad.size === 6) return "2-2-2 enforced";
  return null;
}

/**
 * The page a "Share this squad" link opens, in whichever design the visitor
 * is on. Its behaviour is `useSharedSquad`, called here so that switching
 * design keeps the squad.
 */
export default function SharedSquadContent() {
  const { design, ready } = useDesign();
  const shared = useSharedSquad();
  // The saved design is only known after mount; see SquadPage.
  if (!ready) return null;
  if (design === "refresh") return <SharedSquadRefresh shared={shared} />;
  return <SharedSquadClassic shared={shared} />;
}

function SharedSquadClassic({ shared: view }: { shared: SharedSquad }) {
  if (view.status === "loading") {
    return <div className={styles.container} />;
  }

  if (view.status === "invalid") {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <h1 className={styles.errorTitle}>This link didn&apos;t open</h1>
          <p className={styles.errorText}>{SHARED_SQUAD_ERRORS[view.reason]}</p>
          <div className={styles.actions}>
            <Link className={styles.linkBtn} href="/squad" prefetch={false}>
              Go to the squad generator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { squad, rolls, presetHref, handleReroll, handleRerollSlot } = view;
  const composition = compositionLabel(squad);

  return (
    <div className={styles.container}>
      <h1 className={styles.headline}>
        {view.ownRoll
          ? "Here's your squad"
          : "Someone randomized this squad for you"}
      </h1>

      <div className={styles.slots}>
        {Array.from({ length: squad.size }, (_, index) => {
          const heroKey = view.heroes[index] ?? null;
          const hero = heroKey ? heroByKey.get(heroKey) : undefined;
          const perkLabels = heroKey
            ? perksFromIndices(heroKey, view.perks[index] ?? null)
            : null;
          const name = squad.names[index] ?? "";

          return (
            <div className={styles.slot} key={index}>
              <span
                className={`${styles.slotName} ${name ? "" : styles.slotNamePlaceholder}`}
              >
                {name || `Player ${index + 1}`}
              </span>

              {hero ? (
                <>
                  <div
                    className={styles.slotHeroRow}
                    key={`hero-${index}-${rolls}`}
                  >
                    <SpriteIcon
                      className={styles.slotHeroIcon}
                      heroKey={hero.key}
                      type="icon"
                      alt={`${hero.name} icon`}
                    />
                    <RoleSpriteIcon
                      className={styles.slotRoleIcon}
                      roleKey={hero.role}
                      alt={hero.role}
                    />
                    <span className={styles.slotHeroName}>{hero.name}</span>
                    <button
                      className={styles.slotReroll}
                      onClick={() => handleRerollSlot(index)}
                      title="Reroll this slot"
                    >
                      ↻
                    </button>
                  </div>
                  {squad.randomizePerks && perkLabels && (
                    <div className={styles.slotPerks}>
                      <span className={styles.perkMinor}>
                        {perkLabels.minor}
                      </span>
                      <span className={styles.perkSep}>|</span>
                      <span className={styles.perkMajor}>
                        {perkLabels.major}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.slotEmpty}>—</div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button className={styles.primaryBtn} onClick={handleReroll}>
          Randomize again
        </button>
      </div>

      <div className={styles.secondaryRow}>
        <ShareButton
          className={styles.linkBtn}
          buildUrl={view.buildResultUrl}
          shareType="squad_result"
          shareSource="shared_squad"
          label="Share this squad"
        />
        {/* Full page load so the squad generator reads the preset on mount. */}
        <a
          className={styles.linkBtn}
          href={presetHref}
          title="Open the squad generator with this setup applied"
        >
          Open in the generator
        </a>
        <Link className={styles.linkBtn} href="/squad" prefetch={false}>
          Start fresh
        </Link>
      </div>

      <p className={styles.optionsSummary}>
        {squad.size} {squad.size === 1 ? "hero" : "heroes"}
        {composition ? ` · ${composition}` : ""}
        {squad.slots.some((slot) => slot !== null)
          ? " · slot filters included"
          : ""}
      </p>
    </div>
  );
}
