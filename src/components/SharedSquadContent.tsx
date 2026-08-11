"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PerkPick } from "@/types/hero";
import { getAllHeroes } from "@/data/heroes";
import { perksFromIndices, randomPerkIndices } from "@/lib/heroService";
import {
  computeSquad,
  pickForSlot,
  slotConfigsFromEnabled,
} from "@/lib/squadService";
import { ShareErrorReason } from "@/lib/share/binary";
import { tryDecodeShare } from "@/lib/share/codec";
import { SquadPreset } from "@/lib/share/types";
import {
  SHARE_PARAM,
  SHARE_PATHS,
  readShareParam,
  sharePath,
  shareUrl,
} from "@/lib/share/urls";
import RoleSpriteIcon from "./RoleSpriteIcon";
import ShareButton from "./ShareButton";
import SpriteIcon from "./SpriteIcon";
import styles from "./SharedContent.module.css";

const heroByKey = new Map(getAllHeroes().map((hero) => [hero.key, hero]));

type ViewState =
  | { status: "loading" }
  | { status: "invalid"; reason: ShareErrorReason }
  | {
      status: "ready";
      squad: SquadPreset;
      heroes: (string | null)[];
      perks: (PerkPick | null)[];
      ownRoll: boolean;
    };

const ERROR_TEXT: Record<ShareErrorReason, string> = {
  "unsupported-version":
    "This link was made with a newer version of the site. Refresh the page and open it again.",
  corrupt:
    "This link looks like it was cut off or altered on the way here, so the squad it points at can't be trusted.",
  malformed: "This share link isn't valid.",
};

function compositionLabel(squad: SquadPreset): string | null {
  if (squad.force122 && squad.size === 5) return "1-2-2 enforced";
  if (squad.force222 && squad.size === 6) return "2-2-2 enforced";
  return null;
}

export default function SharedSquadContent() {
  const [view, setView] = useState<ViewState>({ status: "loading" });
  const [rolls, setRolls] = useState(0);

  useEffect(() => {
    const raw = readShareParam(window.location.search);
    const decoded = tryDecodeShare(raw);

    if (!decoded.ok) {
      setView({ status: "invalid", reason: decoded.reason });
      return;
    }

    if (decoded.payload.kind !== "squad-result") {
      window.location.replace(
        `${SHARE_PATHS[decoded.payload.kind]}?${SHARE_PARAM}=${raw}`,
      );
      return;
    }

    setView({
      status: "ready",
      squad: decoded.payload.squad,
      heroes: decoded.payload.result.heroes,
      perks: decoded.payload.result.perks,
      ownRoll: false,
    });
  }, []);

  const publish = useCallback(
    (
      squad: SquadPreset,
      heroes: (string | null)[],
      perks: (PerkPick | null)[],
    ) => {
      setView({ status: "ready", squad, heroes, perks, ownRoll: true });
      setRolls((count) => count + 1);
      window.history.replaceState(
        null,
        "",
        sharePath({ kind: "squad-result", squad, result: { heroes, perks } }),
      );
    },
    [],
  );

  const handleReroll = useCallback(() => {
    if (view.status !== "ready") return;
    const { squad } = view;
    const configs = slotConfigsFromEnabled(squad.slots, squad.names);
    const rolled = computeSquad(
      configs,
      squad.size,
      squad.force122,
      squad.force222,
    );
    publish(
      squad,
      rolled.map((hero) => hero?.key ?? null),
      rolled.map((hero) =>
        squad.randomizePerks && hero ? randomPerkIndices(hero.key) : null,
      ),
    );
  }, [view, publish]);

  const handleRerollSlot = useCallback(
    (index: number) => {
      if (view.status !== "ready") return;
      const { squad, heroes, perks } = view;
      const configs = slotConfigsFromEnabled(squad.slots, squad.names);
      const taken = new Set<string>();
      heroes.forEach((key, i) => {
        if (i !== index && key) taken.add(key);
      });

      const hero = pickForSlot(configs[index].disabledHeroes, taken);
      const nextHeroes = [...heroes];
      const nextPerks = [...perks];
      nextHeroes[index] = hero?.key ?? null;
      nextPerks[index] =
        squad.randomizePerks && hero ? randomPerkIndices(hero.key) : null;
      publish(squad, nextHeroes, nextPerks);
    },
    [view, publish],
  );

  if (view.status === "loading") {
    return <div className={styles.container} />;
  }

  if (view.status === "invalid") {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <h1 className={styles.errorTitle}>This link didn&apos;t open</h1>
          <p className={styles.errorText}>{ERROR_TEXT[view.reason]}</p>
          <div className={styles.actions}>
            <Link className={styles.linkBtn} href="/squad" prefetch={false}>
              Go to the squad generator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { squad } = view;
  const composition = compositionLabel(squad);
  const presetHref = sharePath({ kind: "squad-preset", squad });

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
          buildUrl={() =>
            shareUrl({
              kind: "squad-result",
              squad,
              result: { heroes: view.heroes, perks: view.perks },
            })
          }
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
