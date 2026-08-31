"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import posthog from "posthog-js";
import Link from "next/link";
import { PerkPick } from "@/types/hero";
import { getAllHeroes } from "@/data/heroes";
import {
  perksFromIndices,
  randomHero,
  randomPerkIndices,
} from "@/lib/heroService";
import { ShareErrorReason } from "@/lib/share/binary";
import { tryDecodeShare } from "@/lib/share/codec";
import { PickerPreset } from "@/lib/share/types";
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
      picker: PickerPreset;
      heroKey: string | null;
      perks: PerkPick | null;
      /** True once the visitor has rolled for themselves. */
      ownRoll: boolean;
    };

const ERROR_TEXT: Record<ShareErrorReason, string> = {
  "unsupported-version":
    "This link was made with a newer version of the site. Refresh the page and open it again.",
  corrupt:
    "This link looks like it was cut off or altered on the way here, so the hero it points at can't be trusted.",
  malformed: "This share link isn't valid.",
};

export default function SharedHeroContent() {
  const [view, setView] = useState<ViewState>({ status: "loading" });
  // Counted separately so re-rolling perks doesn't replay the hero animations.
  const [heroRolls, setHeroRolls] = useState(0);
  const [perkRolls, setPerkRolls] = useState(0);
  const [poolOpen, setPoolOpen] = useState(false);
  const portraitRef = useRef<HTMLDivElement>(null);

  // Read straight from the URL rather than useSearchParams: the page is
  // client-only, and this keeps the static export free of a Suspense boundary.
  useEffect(() => {
    const raw = readShareParam(window.location.search);
    const decoded = tryDecodeShare(raw);

    if (!decoded.ok) {
      setView({ status: "invalid", reason: decoded.reason });
      return;
    }

    // The kind travels inside the payload, so a link opened on the wrong page
    // can send itself where it belongs.
    if (decoded.payload.kind !== "hero-result") {
      window.location.replace(
        `${SHARE_PATHS[decoded.payload.kind]}?${SHARE_PARAM}=${raw}`,
      );
      return;
    }

    setView({
      status: "ready",
      picker: decoded.payload.picker,
      heroKey: decoded.payload.result.heroKey,
      perks: decoded.payload.result.perks,
      ownRoll: false,
    });
  }, []);

  const pool = useMemo(() => {
    if (view.status !== "ready") return [];
    const all = getAllHeroes();
    const selected = all.filter((hero) =>
      view.picker.selected.includes(hero.key),
    );
    // Matches the picker: no selection means every hero is in play.
    return selected.length > 0 ? selected : all;
  }, [view]);

  const publish = useCallback(
    (
      picker: PickerPreset,
      heroKey: string,
      perks: PerkPick | null,
      heroChanged: boolean,
    ) => {
      setView({ status: "ready", picker, heroKey, perks, ownRoll: true });
      setPerkRolls((count) => count + 1);
      window.history.replaceState(
        null,
        "",
        sharePath({ kind: "hero-result", picker, result: { heroKey, perks } }),
      );

      if (!heroChanged) return;
      setHeroRolls((count) => count + 1);

      if (portraitRef.current) {
        portraitRef.current.classList.remove("hero-portrait-animate");
        void portraitRef.current.offsetWidth;
        portraitRef.current.classList.add("hero-portrait-animate");
      }
    },
    [],
  );

  const handleReroll = useCallback(() => {
    if (view.status !== "ready" || pool.length === 0) return;
    const hero = randomHero(pool, {
      preventRepeat: view.picker.nonRepeating,
      previousHeroKey: view.heroKey ?? "",
    });
    publish(
      view.picker,
      hero.key,
      view.picker.showPerks ? randomPerkIndices(hero.key) : null,
      true,
    );
    if (posthog.__loaded) {
      posthog.capture("hero_randomized", {
        hero_role: hero.role,
        pool_size: pool.length,
        non_repeating: view.picker.nonRepeating,
        perks_enabled: view.picker.showPerks,
        source: "shared_result",
      });
    }
  }, [view, pool, publish]);

  const handleRerollPerks = useCallback(() => {
    if (view.status !== "ready" || !view.heroKey) return;
    publish(view.picker, view.heroKey, randomPerkIndices(view.heroKey), false);
    if (posthog.__loaded) {
      posthog.capture("perks_randomized", { source: "shared_result" });
    }
  }, [view, publish]);

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
            <Link className={styles.linkBtn} href="/" prefetch={false}>
              Go to the hero picker
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hero = view.heroKey ? heroByKey.get(view.heroKey) : undefined;
  const perkLabels = view.heroKey
    ? perksFromIndices(view.heroKey, view.perks)
    : null;
  const presetHref = sharePath({
    kind: "picker-preset",
    picker: view.picker,
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.headline}>
        {view.ownRoll
          ? "Here's your hero"
          : "Someone randomized this hero for you"}
      </h1>

      {hero ? (
        <div className={`result-card ${styles.resultCard}`}>
          {view.picker.showPortrait && (
            <SpriteIcon
              ref={portraitRef}
              heroKey={hero.key}
              type="portrait"
              className={`${styles.portrait} hero-portrait-animate`}
              alt={`${hero.name} portrait`}
            />
          )}

          <h2
            key={`name-${heroRolls}`}
            className={`${styles.heroName} hero-name-animate`}
          >
            <RoleSpriteIcon
              roleKey={hero.role}
              alt={hero.role}
              className={styles.roleIcon}
            />
            {hero.name}
          </h2>

          {view.picker.showPerks && perkLabels && (
            <>
              <div
                key={`perks-${perkRolls}`}
                className={`${styles.perks} perks-animate`}
              >
                <span className={styles.perkMinor}>{perkLabels.minor}</span>
                <span className={styles.perkSep}>|</span>
                <span className={styles.perkMajor}>{perkLabels.major}</span>
              </div>

              <div className="result-actions">
                <button
                  className="action-button btn-perks"
                  onClick={handleRerollPerks}
                >
                  ↻ Randomize perks
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <p className={styles.errorText}>
          This link points at a hero this version of the site doesn&apos;t know.
          Roll again to get one.
        </p>
      )}

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
              kind: "hero-result",
              picker: view.picker,
              result: { heroKey: view.heroKey, perks: view.perks },
            })
          }
          label="Share this roll"
        />
        {/*
          A full page load, not a client navigation: the provider reads the
          preset once on mount, so a router push would not apply it.
        */}
        <a
          className={styles.linkBtn}
          href={presetHref}
          title="Open the picker with these filters and options applied"
        >
          Open in the picker
        </a>
        <Link className={styles.linkBtn} href="/" prefetch={false}>
          Start fresh
        </Link>
      </div>

      <div className={styles.poolSummary}>
        <button
          className={styles.poolToggle}
          onClick={() => setPoolOpen(!poolOpen)}
        >
          {view.picker.selected.length === 0
            ? "Picked from all heroes"
            : `Picked from ${pool.length} ${pool.length === 1 ? "hero" : "heroes"}`}
          {poolOpen ? " ▾" : " ▸"}
        </button>

        {poolOpen && (
          <div className={styles.poolList}>
            {pool.map((poolHero) => (
              <SpriteIcon
                key={poolHero.key}
                heroKey={poolHero.key}
                type="icon"
                className={styles.poolIcon}
                alt={poolHero.name}
              />
            ))}
          </div>
        )}

        {view.picker.nonRepeating && (
          <p className={styles.optionsSummary}>
            Non-repeating mode is on, so a re-roll won&apos;t give the same hero
            twice.
          </p>
        )}
      </div>
    </div>
  );
}
