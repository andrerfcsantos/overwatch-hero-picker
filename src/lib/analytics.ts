/**
 * The only module that talks to PostHog.
 *
 * Components call {@link track} with an event from {@link EventMap}, so the
 * whole schema lives here and a typo or a stray property is a compile error.
 * Before init (or when the env vars are absent) every call is a silent no-op.
 *
 * The slim build halves the SDK's share of first-load JS, but it ships an empty
 * extension registry — anything not listed in `__extensionClasses` below is
 * simply never constructed, silently. Each bundle here is a loader stub; the
 * heavy payload (rrweb and friends) still arrives lazily from `api_host`.
 */
import posthog, { type CaptureResult } from "posthog-js/dist/module.slim";
import {
  AnalyticsExtensions,
  ErrorTrackingExtensions,
  SessionReplayExtensions,
} from "posthog-js/dist/extension-bundles";
import { HeroRole } from "@/types/hero";

/** One value per share surface, so the funnel can tell them apart. */
export type ShareType =
  | "hero_result"
  | "picker_preset"
  | "squad_result"
  | "squad_preset"
  | "preset";

export type ShareSource =
  | "picker"
  | "squad"
  | "shared_hero"
  | "shared_squad"
  | "preset_bar"
  | "manage_page";

export type PresetKind = "builtin" | "custom";

interface HeroPoolProps {
  pool_size: number;
  /** Every key in the pool, so exclusions are queryable per hero. */
  pool_hero_keys: string[];
  pool_tank: number;
  pool_damage: number;
  pool_support: number;
}

/** The full pool composition, attached to each roll instead of per-toggle events. */
export function heroPoolProps(
  pool: readonly { key: string; role: HeroRole }[],
): HeroPoolProps {
  return {
    pool_size: pool.length,
    pool_hero_keys: pool.map((hero) => hero.key),
    pool_tank: pool.filter((hero) => hero.role === "TANK").length,
    pool_damage: pool.filter((hero) => hero.role === "DAMAGE").length,
    pool_support: pool.filter((hero) => hero.role === "SUPPORT").length,
  };
}

type EventMap = {
  hero_randomized: {
    source: "picker" | "shared_result";
    hero_key: string;
    hero_role: HeroRole;
    non_repeating: boolean;
    perks_enabled: boolean;
  } & HeroPoolProps;
  perks_randomized: {
    source: "picker" | "shared_result";
    hero_key: string;
    hero_role: HeroRole;
  };
  squad_randomized: {
    source: "generator" | "shared_result";
    squad_size: number;
    force_122: boolean;
    force_222: boolean;
    perks_enabled: boolean;
    filtered_slot_count: number;
  };
  squad_slot_rerolled: {
    source: "generator" | "shared_result";
    squad_size: number;
    slot_index: number;
    perks_enabled: boolean;
  };
  squad_size_changed: { squad_size: number };
  squad_option_changed: {
    option: "force_122" | "force_222" | "randomize_perks";
    enabled: boolean;
  };
  squad_copied_as_text: { squad_size: number; perks_enabled: boolean };
  squad_slot_filters_changed: {
    action: "edit" | "reset" | "reset_all";
    /** Null for reset_all, which touches every slot. */
    slot_index: number | null;
    disabled_count: number;
  };
  hero_filters_changed: {
    action:
      | "select_all"
      | "unselect_all"
      | "select_role"
      | "unselect_role"
      | "select_only_role";
    role?: HeroRole;
  };
  picker_option_changed: {
    option: "show_portrait" | "randomize_perks" | "non_repeating";
    enabled: boolean;
  };
  share_link_copied: {
    share_type: ShareType;
    source: ShareSource;
    /** "fallback" means the clipboard failed and the link was shown instead. */
    method: "clipboard" | "fallback";
  };
  shared_link_opened: {
    share_type: ShareType | "unknown";
    valid: boolean;
    invalid_reason?: string;
  };
  shared_preset_undone: { share_type: "picker_preset" | "squad_preset" };
  shared_preset_dismissed: { share_type: "picker_preset" | "squad_preset" };
  preset_applied: {
    preset_kind: PresetKind;
    /** Stable id for built-ins; custom names stay private. */
    builtin_id?: string;
    hero_count: number;
    source: "chip" | "keyboard" | "manage_page";
  };
  preset_created: { hero_count: number };
  preset_updated: { preset_kind: PresetKind; hero_count: number };
  preset_deleted: { preset_kind: PresetKind };
  preset_managed: {
    action:
      | "renamed"
      | "duplicated"
      | "moved"
      | "reverted"
      | "unselected"
      | "restored_defaults";
  };
  keyboard_shortcut_used: { key: string };
};

let initialized = false;

/**
 * Share payloads travel in the `d` query param as unique blobs. Left alone
 * they would make every share link its own URL in PostHog, fragmenting the
 * pages you most want to compare — so the blob never leaves the browser.
 */
const SHARE_BLOB = /([?&]d=)[^&#]+/g;

/** One entry of a `$exception` event's `$exception_list`. */
type CapturedException = {
  mechanism?: { synthetic?: boolean };
  stacktrace?: { frames?: unknown[] };
};

/**
 * An extension or injected script that throws reaches `window.onerror` as a
 * bare message string. PostHog wraps it as a synthetic `$exception` with no
 * stack frames, so there is no source file to symbolicate and nothing that
 * ties it to our code. A `blob:` URL made in the page still carries our
 * origin, so the error wears our domain even though we own no worker. Drop
 * these; real errors keep their frames and pass through.
 */
export function isStacklessThirdPartyException(event: CaptureResult): boolean {
  if (event.event !== "$exception") return false;
  const list = event.properties?.$exception_list as
    | CapturedException[]
    | undefined;
  if (!Array.isArray(list) || list.length === 0) return false;
  return list.every(
    (exception) =>
      exception?.mechanism?.synthetic === true &&
      !exception?.stacktrace?.frames?.length,
  );
}

function scrubUrls(container: unknown): void {
  if (typeof container !== "object" || container === null) return;
  const record = container as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    const value = record[key];
    const lower = key.toLowerCase();
    if (
      typeof value === "string" &&
      (lower.includes("url") || lower.includes("referrer"))
    ) {
      record[key] = value.replace(SHARE_BLOB, "$1REDACTED");
    }
  }
}

export function initAnalytics(projectToken: string, host: string): void {
  posthog.init(projectToken, {
    __extensionClasses: {
      // Session replay, plus the autocapture/web-vitals family. Without these
      // the slim build captures pageviews and manual `capture` calls only.
      ...SessionReplayExtensions,
      ...AnalyticsExtensions,
      // The pair `capture_exceptions` below needs to have any effect.
      ...ErrorTrackingExtensions,
    },
    // `host` is the first-party proxy (r.owheropicker.com), which ad blockers
    // do not recognize; `ui_host` still has to name the real PostHog app so the
    // toolbar and its links resolve.
    api_host: host,
    ui_host: "https://us.posthog.com",
    defaults: "2026-08-30",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
    // Dev events are flagged as internal traffic, but recordings would still
    // count against the replay quota — so don't record localhost sessions.
    disable_session_recording: process.env.NODE_ENV === "development",
    before_send: (event) => {
      if (!event) return null;
      if (isStacklessThirdPartyException(event)) return null;
      scrubUrls(event.properties);
      scrubUrls(event.properties?.$set);
      scrubUrls(event.properties?.$set_once);
      scrubUrls(event.$set);
      scrubUrls(event.$set_once);
      return event;
    },
  });
  initialized = true;
}

export function track<E extends keyof EventMap>(
  event: E,
  properties: EventMap[E],
): void {
  if (initialized) posthog.capture(event, properties);
}
