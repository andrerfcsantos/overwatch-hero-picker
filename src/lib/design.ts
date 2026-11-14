/**
 * The site wears one of two designs while the redesign is being adopted, and
 * every visitor can move between them whenever they like. This module is the
 * single place that knows which design applies; nothing else reads the
 * storage key or the overlay's link parameter.
 */
export const DESIGNS = ["classic", "refresh"] as const;

export type Design = (typeof DESIGNS)[number];

/** Where a visitor's own choice is kept. */
export const DESIGN_STORAGE_KEY = "design";

/** Set once the invitation to try the new design has been closed. */
export const DESIGN_INVITE_DISMISSED_KEY = "designInviteDismissed";

/** Set once the request for feedback on the new design has been closed. */
export const DESIGN_FEEDBACK_DISMISSED_KEY = "designFeedbackDismissed";

/** Where feedback on the new design goes. */
export const FEEDBACK_URL = "https://discord.gg/rwQMrCa";

/**
 * The overlay runs inside OBS, which shares no storage with the streamer's
 * browser, so its design travels in the link like its filters do. A link
 * without the parameter keeps the classic card: overlays already on stream
 * must not change under the streamer.
 */
export const OVERLAY_DESIGN_PARAM = "look";

export function isDesign(value: unknown): value is Design {
  return DESIGNS.some((design) => design === value);
}

/**
 * What a visitor sees before they have chosen. Set at build time with
 * `NEXT_PUBLIC_DEFAULT_DESIGN`, so flipping the default is a redeploy rather
 * than a code change.
 */
export const DEFAULT_DESIGN: Design = isDesign(
  process.env.NEXT_PUBLIC_DEFAULT_DESIGN,
)
  ? process.env.NEXT_PUBLIC_DEFAULT_DESIGN
  : "classic";

export interface DesignChoice {
  design: Design;
  /** True when the visitor picked it, false when it is just the default. */
  chosen: boolean;
}

type DesignStorage = Pick<Storage, "getItem" | "setItem">;

/** The browser's storage, or null where there is none to use. */
function defaultStorage(): DesignStorage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    // Storage can be blocked outright, in which case the getter throws.
    return null;
  }
}

/** The design to show, and whether the visitor asked for it. Never throws. */
export function readDesignChoice(
  storage: DesignStorage | null = defaultStorage(),
): DesignChoice {
  try {
    const stored = storage?.getItem(DESIGN_STORAGE_KEY);
    if (isDesign(stored)) return { design: stored, chosen: true };
  } catch {
    // Fall through to the default.
  }
  return { design: DEFAULT_DESIGN, chosen: false };
}

/** Best effort: without storage the choice only lasts for the visit. */
export function storeDesign(
  design: Design,
  storage: DesignStorage | null = defaultStorage(),
): void {
  try {
    storage?.setItem(DESIGN_STORAGE_KEY, design);
  } catch {
    // Quota or privacy settings; nothing useful to do.
  }
}

/** The design an overlay link asks for. */
export function overlayDesignFromSearch(search: string): Design {
  const value = new URLSearchParams(search).get(OVERLAY_DESIGN_PARAM);
  return isDesign(value) ? value : "classic";
}

/** Fonts only the new design uses, fetched early for visitors who are on it. */
const REFRESH_FONTS = [
  "/assets/fonts/ConfigCondensedRegular.otf",
  "/assets/fonts/ConfigCondensedMedium.otf",
  "/assets/fonts/ConfigCondensedSemiBold.otf",
];

/**
 * Runs in `<head>` before the first paint. The site is a static export, so
 * the server cannot know the visitor's design; this stamps it on `<html>`
 * early enough that the navbar and page background never flash the wrong one.
 * It repeats {@link readDesignChoice} in plain JavaScript because it runs
 * before any module has loaded.
 */
export const DESIGN_BOOT_SCRIPT = `(function(){var d=${JSON.stringify(DEFAULT_DESIGN)};try{var s=localStorage.getItem(${JSON.stringify(DESIGN_STORAGE_KEY)});if(${DESIGNS.map((design) => `s===${JSON.stringify(design)}`).join("||")})d=s}catch(e){}document.documentElement.dataset.design=d;if(d==="refresh"){${JSON.stringify(REFRESH_FONTS)}.forEach(function(h){var l=document.createElement("link");l.rel="preload";l.as="font";l.type="font/otf";l.crossOrigin="anonymous";l.href=h;document.head.appendChild(l)})}})();`;
