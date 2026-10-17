"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { getAllHeroes } from "@/data/heroes";
import { perksFromIndices } from "@/lib/heroService";
import { RoomConnectionStatus, openRoomSocket } from "@/lib/rooms/client";
import {
  ROOM_VIEW_PARAM,
  RoomRoll,
  isViewId,
  parseViewerMessage,
} from "@/lib/rooms/protocol";
import RoleSpriteIcon from "./RoleSpriteIcon";
import SpriteIcon from "./SpriteIcon";
import styles from "./CompanionContent.module.css";

const heroByKey = new Map(getAllHeroes().map((hero) => [hero.key, hero]));

type ViewState =
  | { status: "loading" }
  | { status: "invalid" }
  | {
      status: "ready";
      connection: RoomConnectionStatus;
      /** Undefined until the room has answered at least once. */
      roll: RoomRoll | null | undefined;
      overlayOnline: boolean;
      /** Bumped per roll so the card replays its entrance. */
      rolls: number;
    };

const BASE_TITLE = "Stream companion | Overwatch Hero Picker";

function timeAgo(then: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - then) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} h ago`;
}

/** Keeps a phone's screen on while the page is visible. Best effort. */
function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      if (document.visibilityState !== "visible" || lock) return;
      try {
        const sentinel = await navigator.wakeLock.request("screen");
        if (cancelled) {
          void sentinel.release();
          return;
        }
        lock = sentinel;
        sentinel.addEventListener("release", () => {
          if (lock === sentinel) lock = null;
        });
      } catch {
        // Denied, or the page is not visible; the screen just may sleep.
      }
    };

    // The browser drops the lock when the page is hidden; take it back.
    document.addEventListener("visibilitychange", request);
    void request();
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", request);
      void lock?.release();
    };
  }, [active]);
}

/**
 * Shows the hero the streamer's overlay just rolled, live, on another screen.
 * The overlay publishes each roll to a room on the rooms Worker; this page
 * listens to that room with its view id, which can watch but not post.
 */
export default function CompanionContent() {
  const [view, setView] = useState<ViewState>({ status: "loading" });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const viewId = new URLSearchParams(window.location.search).get(
      ROOM_VIEW_PARAM,
    );
    if (!isViewId(viewId)) {
      setView({ status: "invalid" });
      track("companion_opened", { valid: false });
      return;
    }
    track("companion_opened", { valid: true });

    setView({
      status: "ready",
      connection: "connecting",
      roll: undefined,
      overlayOnline: false,
      rolls: 0,
    });

    const update = (
      change: (current: ViewState & { status: "ready" }) => ViewState,
    ) =>
      setView((current) =>
        current.status === "ready" ? change(current) : current,
      );

    const socket = openRoomSocket({
      target: { role: "viewer", viewId },
      onStatus: (connection) =>
        update((current) => ({ ...current, connection })),
      onMessage: (data) => {
        const message = parseViewerMessage(data);
        if (!message) return;
        update((current) => {
          switch (message.type) {
            case "state": {
              const changed = message.roll?.id !== current.roll?.id;
              return {
                ...current,
                roll: message.roll,
                overlayOnline: message.overlayOnline,
                rolls: changed ? current.rolls + 1 : current.rolls,
              };
            }
            case "roll":
              return {
                ...current,
                roll: message.roll,
                // Only the overlay posts rolls, so it is evidently online.
                overlayOnline: true,
                rolls:
                  message.roll.id === current.roll?.id
                    ? current.rolls
                    : current.rolls + 1,
              };
            case "presence":
              return { ...current, overlayOnline: message.overlayOnline };
          }
        });
      },
    });
    return () => socket.close();
  }, []);

  // Keeps "rolled 2 min ago" honest.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(timer);
  }, []);

  useWakeLock(view.status === "ready");

  const roll = view.status === "ready" ? view.roll : undefined;
  const hero = roll ? heroByKey.get(roll.heroKey) : undefined;
  const perks = roll && hero ? perksFromIndices(hero.key, roll.perks) : null;

  // The tab title names the hero, for a second-monitor tab strip.
  useEffect(() => {
    document.title = hero ? `${hero.name} | Stream companion` : BASE_TITLE;
  }, [hero]);

  if (view.status === "loading") {
    return <main className={styles.page} />;
  }

  if (view.status === "invalid") {
    return (
      <main className={styles.page}>
        <div className={styles.message} role="alert">
          <h1>This companion link is invalid</h1>
          <p>
            Copy it again from the <strong>Stream overlay</strong> panel on the
            hero picker.
          </p>
        </div>
      </main>
    );
  }

  const status = (() => {
    if (view.connection !== "open") {
      return {
        tone: "muted",
        text:
          view.connection === "connecting" ? "Connecting…" : "Reconnecting…",
      };
    }
    if (view.roll === null) {
      return { tone: "muted", text: "Waiting for the overlay" };
    }
    return view.overlayOnline
      ? { tone: "live", text: "Live on stream" }
      : { tone: "idle", text: "Overlay hidden" };
  })();

  return (
    <main className={styles.page}>
      <p className={`${styles.status} ${styles[status.tone]}`} role="status">
        <span className={styles.dot} aria-hidden="true" />
        {status.text}
      </p>

      {hero && roll ? (
        <div key={view.rolls} className={styles.card} data-hero={hero.key}>
          <SpriteIcon
            heroKey={hero.key}
            type="portrait"
            className={styles.portrait}
            alt={`${hero.name} portrait`}
          />
          <h1 className={styles.name}>
            <RoleSpriteIcon
              roleKey={hero.role}
              alt={hero.role}
              className={styles.roleIcon}
            />
            {hero.name}
          </h1>
          {perks && (
            <p className={styles.perks}>
              <span className={styles.minorPerk}>{perks.minor}</span>
              <span className={styles.perkDivider}>|</span>
              <span className={styles.majorPerk}>{perks.major}</span>
            </p>
          )}
          <p className={styles.when}>Rolled {timeAgo(roll.rolledAt, now)}</p>
        </div>
      ) : roll ? (
        // A hero this page does not know: it was loaded before a site update
        // that added one, while the overlay already runs the new version.
        <div className={styles.message} role="alert">
          <p>
            The overlay rolled a hero this page doesn&apos;t know yet. Refresh
            the page to see it.
          </p>
        </div>
      ) : (
        view.roll === null && (
          <div className={styles.message}>
            <p>
              Your hero shows up here as soon as the overlay rolls one. If
              nothing appears, copy the overlay link into OBS again — it needs
              the companion turned on.
            </p>
          </div>
        )
      )}

      {!view.overlayOnline && view.roll && view.connection === "open" && (
        <p className={styles.hint}>
          This is the last hero. The next one appears when the overlay is shown
          again.
        </p>
      )}
    </main>
  );
}
