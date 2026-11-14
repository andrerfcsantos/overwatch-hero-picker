"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { heroPoolProps, track } from "@/lib/analytics";
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

/**
 * A shared roll: the hero somebody sent, the pool and settings it came from,
 * and rolling again from them. Both designs' share pages are views of this.
 */
export function useSharedHero() {
  const [view, setView] = useState<ViewState>({ status: "loading" });
  // Counted separately so re-rolling perks doesn't replay the hero animations.
  const [heroRolls, setHeroRolls] = useState(0);
  const [perkRolls, setPerkRolls] = useState(0);
  // Kept here rather than in the new design's view, so switching design and
  // back does not seal a roll the visitor has already seen.
  const [revealed, setRevealed] = useState(false);

  // Read straight from the URL rather than useSearchParams: the page is
  // client-only, and this keeps the static export free of a Suspense boundary.
  useEffect(() => {
    const raw = readShareParam(window.location.search);
    const decoded = tryDecodeShare(raw);

    if (!decoded.ok) {
      // oxlint-disable-next-line react-hooks/set-state-in-effect -- the share link is in the URL, which only exists after mount
      setView({ status: "invalid", reason: decoded.reason });
      track("shared_link_opened", {
        share_type: "unknown",
        valid: false,
        invalid_reason: decoded.reason,
      });
      return;
    }

    // The kind travels inside the payload, so a link opened on the wrong page
    // can send itself where it belongs. The destination reports the open.
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
    track("shared_link_opened", { share_type: "hero_result", valid: true });
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
      if (heroChanged) setHeroRolls((count) => count + 1);
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
    track("hero_randomized", {
      source: "shared_result",
      hero_key: hero.key,
      hero_role: hero.role,
      non_repeating: view.picker.nonRepeating,
      perks_enabled: view.picker.showPerks,
      ...heroPoolProps(pool),
    });
  }, [view, pool, publish]);

  const handleRerollPerks = useCallback(() => {
    if (view.status !== "ready" || !view.heroKey) return;
    publish(view.picker, view.heroKey, randomPerkIndices(view.heroKey), false);
    const hero = heroByKey.get(view.heroKey);
    if (hero) {
      track("perks_randomized", {
        source: "shared_result",
        hero_key: hero.key,
        hero_role: hero.role,
      });
    }
  }, [view, publish]);

  if (view.status !== "ready") return view;

  const hero = view.heroKey ? heroByKey.get(view.heroKey) : undefined;
  return {
    status: "ready" as const,
    /** True once the visitor has asked to see a roll somebody sent. */
    revealed,
    reveal: () => {
      if (revealed) return;
      setRevealed(true);
      track("shared_result_revealed", { share_type: "hero_result" });
    },
    picker: view.picker,
    ownRoll: view.ownRoll,
    /** Undefined when the link names a hero this version does not know. */
    hero,
    perkLabels: view.heroKey
      ? perksFromIndices(view.heroKey, view.perks)
      : null,
    pool,
    /** True when the roll could have been any hero. */
    everyHero: view.picker.selected.length === 0,
    heroRolls,
    perkRolls,
    handleReroll,
    handleRerollPerks,
    /** Opens the picker with this pool and these roll settings. */
    presetHref: sharePath({ kind: "picker-preset", picker: view.picker }),
    buildResultUrl: () =>
      shareUrl({
        kind: "hero-result",
        picker: view.picker,
        result: { heroKey: view.heroKey, perks: view.perks },
      }),
  };
}

export type SharedHero = ReturnType<typeof useSharedHero>;
export type SharedHeroReady = Extract<SharedHero, { status: "ready" }>;

export const SHARED_HERO_ERRORS: Record<ShareErrorReason, string> = {
  "unsupported-version":
    "This link was made with a newer version of the site. Refresh the page and open it again.",
  corrupt:
    "This link looks like it was cut off or altered on the way here, so the hero it points at can't be trusted.",
  malformed: "This share link isn't valid.",
};
