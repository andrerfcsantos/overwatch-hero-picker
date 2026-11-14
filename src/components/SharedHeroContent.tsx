"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDesign } from "@/context/DesignContext";
import {
  SHARED_HERO_ERRORS,
  type SharedHero,
  useSharedHero,
} from "@/hooks/useSharedHero";
import SharedHeroRefresh from "./refresh/SharedHeroRefresh";
import RoleSpriteIcon from "./RoleSpriteIcon";
import ShareButton from "./ShareButton";
import SpriteIcon from "./SpriteIcon";
import styles from "./SharedContent.module.css";

/**
 * The page a "Share this roll" link opens, in whichever design the visitor is
 * on. Its behaviour is `useSharedHero`, called here so that switching design
 * keeps the roll.
 */
export default function SharedHeroContent() {
  const { design, ready } = useDesign();
  const shared = useSharedHero();
  // The saved design is only known after mount; see PickerPage.
  if (!ready) return null;
  if (design === "refresh") return <SharedHeroRefresh shared={shared} />;
  return <SharedHeroClassic shared={shared} />;
}

function SharedHeroClassic({ shared: view }: { shared: SharedHero }) {
  const [poolOpen, setPoolOpen] = useState(false);
  const portraitRef = useRef<HTMLDivElement>(null);
  const heroRolls = view.status === "ready" ? view.heroRolls : 0;

  // Replays the portrait's entrance on each roll the visitor asks for.
  useEffect(() => {
    const portrait = portraitRef.current;
    if (heroRolls === 0 || !portrait) return;
    portrait.classList.remove("hero-portrait-animate");
    void portrait.offsetWidth;
    portrait.classList.add("hero-portrait-animate");
  }, [heroRolls]);

  if (view.status === "loading") {
    return <div className={styles.container} />;
  }

  if (view.status === "invalid") {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <h1 className={styles.errorTitle}>This link didn&apos;t open</h1>
          <p className={styles.errorText}>{SHARED_HERO_ERRORS[view.reason]}</p>
          <div className={styles.actions}>
            <Link className={styles.linkBtn} href="/" prefetch={false}>
              Go to the hero picker
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    hero,
    perkLabels,
    pool,
    perkRolls,
    presetHref,
    handleReroll,
    handleRerollPerks,
  } = view;

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
          buildUrl={view.buildResultUrl}
          shareType="hero_result"
          shareSource="shared_hero"
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
          {view.everyHero
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
