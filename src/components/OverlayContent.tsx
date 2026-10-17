"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { heroPoolProps, track } from "@/lib/analytics";
import { getAllHeroes } from "@/data/heroes";
import { perksFromIndices, randomPerkIndices } from "@/lib/heroService";
import {
  OVERLAY_SIZES,
  OverlayConfig,
  matchesShortcut,
  nextOverlayHero,
  readOverlayConfig,
} from "@/lib/overlay";
import { openRoomSocket, RoomSocket } from "@/lib/rooms/client";
import { publisherRollMessage } from "@/lib/rooms/protocol";
import { PickerPreset } from "@/lib/share/types";
import { Hero, PerkPick } from "@/types/hero";
import RoleSpriteIcon from "./RoleSpriteIcon";
import SpriteIcon from "./SpriteIcon";
import styles from "./OverlayContent.module.css";

const allHeroes = getAllHeroes();
const heroByKey = new Map(allHeroes.map((hero) => [hero.key, hero]));

/** Same rule as the picker: an empty (or entirely unknown) selection means every hero. */
function poolFor(picker: PickerPreset): Hero[] {
  const selected = picker.selected
    .map((key) => heroByKey.get(key))
    .filter((hero): hero is Hero => hero !== undefined);
  return selected.length > 0 ? selected : allHeroes;
}

type Trigger = "obs_load" | "obs_hidden" | "keyboard";

interface Roll {
  hero: Hero;
  perks: PerkPick | null;
  count: number;
}

/**
 * The event OBS fires on a browser source's page when the source is shown or
 * hidden (the eye toggle, a Show/Hide hotkey, or its scene going in or out of
 * view). See https://github.com/obsproject/obs-browser#available-events.
 */
const OBS_VISIBLE_EVENT = "obsSourceVisibleChanged";

/**
 * Overwatch has keyboard focus while the streamer plays, so the page cannot
 * hear key presses. Instead the streamer binds one OBS hotkey to both Show and
 * Hide for this source.
 *
 * The setup steps ask for "Shutdown source when not visible", so each show is
 * a fresh page load: the card fades in with a new hero, from an empty source.
 * Without that option OBS keeps the hidden page's last frame and draws it for
 * a moment when the source comes back, showing the previous hero before the
 * new one — nothing the page does can repaint while it is hidden. For that
 * setup the visibility event below still rolls on hide and replays the
 * entrance on show, so rerolling works, just less smoothly.
 */
export default function OverlayContent() {
  const [config, setConfig] = useState<OverlayConfig | null>(null);
  const [roll, setRoll] = useState<Roll | null>(null);
  // Bumped when OBS shows the source, to replay the entrance animation: it
  // already played, unseen, when the hero was rolled while hidden.
  const [reveals, setReveals] = useState(0);
  // Seeded from storage: with the recommended OBS setting, each show is a new
  // load, and non-repeating mode must still see the previous hero.
  const currentHeroKey = useRef<string | null>(null);

  // Read straight from the URL rather than useSearchParams: the page is
  // client-only, and this keeps the static export free of a Suspense boundary.
  useEffect(() => {
    const read = readOverlayConfig(window.location.search);
    setConfig(read);
    track("overlay_opened", {
      valid: read.ok,
      in_obs: "obsstudio" in window,
      has_key: read.ok && read.shortcut !== null,
      has_room: read.ok && read.room !== null,
      size:
        OVERLAY_SIZES.find((size) => size.scale === read.scale)?.id ?? "custom",
    });
  }, []);

  const picker = config?.ok ? config.picker : null;
  const shortcut = config?.ok ? config.shortcut : null;
  const room = config?.ok ? config.room : null;
  const pool = useMemo(() => (picker ? poolFor(picker) : []), [picker]);

  const reroll = useCallback(
    (trigger?: Trigger) => {
      if (!picker || pool.length === 0) return;
      const hero = nextOverlayHero(pool, {
        nonRepeating: picker.nonRepeating,
        previousHeroKey: currentHeroKey.current,
      });
      currentHeroKey.current = hero.key;
      setRoll((previous) => ({
        hero,
        perks: randomPerkIndices(hero.key),
        count: (previous?.count ?? 0) + 1,
      }));
      // A load outside OBS is someone previewing the link, which is not a roll
      // anyone asked for — as with the picker's first hero. In OBS, a load is
      // how the recommended setup rerolls.
      if (trigger) {
        track("hero_randomized", {
          source: "overlay",
          trigger,
          hero_key: hero.key,
          hero_role: hero.role,
          non_repeating: picker.nonRepeating,
          perks_enabled: picker.showPerks,
          ...heroPoolProps(pool),
        });
      }
    },
    [picker, pool],
  );

  // Companion view: when the link carries a room, every roll is published to
  // it so the streamer can see the hero on another screen. The latest roll is
  // re-sent on each (re)connect, so a dropped connection catches up. Nothing
  // here can break the overlay itself: the socket swallows its own failures.
  const latestRollMessage = useRef<string | null>(null);
  const roomSocket = useRef<RoomSocket | null>(null);

  useEffect(() => {
    if (!room) return;
    const socket = openRoomSocket({
      target: { role: "publisher", secret: room },
      onOpen: (send) => {
        if (latestRollMessage.current) send(latestRollMessage.current);
      },
    });
    roomSocket.current = socket;
    return () => {
      socket.close();
      roomSocket.current = null;
    };
  }, [room]);

  useEffect(() => {
    if (!roll || !picker) return;
    // Perks stay off the companion when they are off on stream.
    const message = publisherRollMessage(
      roll.hero.key,
      picker.showPerks ? roll.perks : null,
    );
    latestRollMessage.current = message;
    roomSocket.current?.send(message);
  }, [roll, picker]);

  // First hero, once the filters are known.
  useEffect(() => {
    reroll("obsstudio" in window ? "obs_load" : undefined);
  }, [reroll]);

  useEffect(() => {
    function handleVisibility(event: Event) {
      const visible = (event as CustomEvent<{ visible?: boolean }>).detail
        ?.visible;
      if (visible === false) reroll("obs_hidden");
      else if (visible === true) setReveals((count) => count + 1);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!shortcut || event.repeat) return;
      if (!matchesShortcut(event, shortcut)) return;
      event.preventDefault();
      reroll("keyboard");
    }

    window.addEventListener(OBS_VISIBLE_EVENT, handleVisibility);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener(OBS_VISIBLE_EVENT, handleVisibility);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [reroll, shortcut]);

  const perkLabels =
    roll && picker?.showPerks
      ? perksFromIndices(roll.hero.key, roll.perks)
      : null;

  return (
    <>
      {/* The site's background would otherwise cover the whole stream. This
          ships in the static HTML, so the first frame OBS captures is already
          transparent. */}
      <style>{`html, body { background: transparent !important; overflow: hidden; }`}</style>

      <main
        className={styles.root}
        style={{ "--overlay-scale": config?.scale ?? 1 } as React.CSSProperties}
      >
        {config && !config.ok && (
          <div className={`${styles.card} ${styles.error}`} role="alert">
            <span className={styles.label}>Hero picker overlay</span>
            <span className={styles.errorText}>
              This overlay link is invalid. Copy a new one from
              owheropicker.com.
            </span>
          </div>
        )}

        {roll && picker && (
          <div
            key={`${roll.count}-${reveals}`}
            className={styles.card}
            data-hero={roll.hero.key}
          >
            {picker.showPortrait && (
              <SpriteIcon
                heroKey={roll.hero.key}
                type="portrait"
                className={styles.portrait}
                alt={`${roll.hero.name} portrait`}
              />
            )}
            <div className={styles.text}>
              <span className={styles.label}>Random hero</span>
              <span className={styles.name}>
                <RoleSpriteIcon
                  roleKey={roll.hero.role}
                  alt={roll.hero.role}
                  className={styles.roleIcon}
                />
                {roll.hero.name}
              </span>
              {perkLabels && (
                <span className={styles.perks}>
                  <span className={styles.minorPerk}>{perkLabels.minor}</span>
                  <span className={styles.perkDivider}>|</span>
                  <span className={styles.majorPerk}>{perkLabels.major}</span>
                </span>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
