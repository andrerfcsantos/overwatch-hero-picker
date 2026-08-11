/**
 * Stable index space for share links.
 *
 * Share links encode hero sets as bitmasks and hero results as indices into
 * this array, so its order is part of the URL format. It is APPEND-ONLY:
 *
 *   - Never reorder entries.
 *   - Never remove entries. If a hero leaves the game, keep its slot so old
 *     links keep decoding; `getAllHeroes()` no longer listing it is enough.
 *   - New heroes go at the END, regardless of where they sit in `heroes.ts`.
 *
 * `heroes.test.ts` pins the existing prefix and fails if this is violated.
 *
 * Indices up to 254 are addressable (255 is reserved as the "no hero" marker).
 * If the roster ever passes that, bump SHARE_VERSION and switch to varints.
 */
export const SHARE_HERO_ORDER: readonly string[] = [
  "dva",
  "orisa",
  "reinhardt",
  "roadhog",
  "winston",
  "wreckingball",
  "zarya",
  "doomfist",
  "sigma",
  "junkerqueen",
  "ramattra",
  "mauga",
  "hazard",
  "domina",
  "bastion",
  "genji",
  "hanzo",
  "junkrat",
  "cassidy",
  "mei",
  "pharah",
  "reaper",
  "shion",
  "sierra",
  "soldier76",
  "sombra",
  "symmetra",
  "torbjorn",
  "tracer",
  "widowmaker",
  "ashe",
  "echo",
  "sojourn",
  "venture",
  "freja",
  "anran",
  "emre",
  "vendetta",
  "ana",
  "brigitte",
  "lucio",
  "mercy",
  "moira",
  "zenyatta",
  "baptiste",
  "kiriko",
  "lifeweaver",
  "illari",
  "juno",
  "jetpackcat",
  "mizuki",
  "wuyang",
  "dmon",
];

/** Marker byte for "no hero in this slot". */
export const NO_HERO_INDEX = 0xff;

const indexByKey = new Map<string, number>(
  SHARE_HERO_ORDER.map((key, index) => [key, index]),
);

/** Share index for a hero key, or `undefined` if the hero is not in the table. */
export function shareIndexOf(heroKey: string): number | undefined {
  return indexByKey.get(heroKey);
}

/** Hero key for a share index, or `undefined` if out of range. */
export function heroKeyAt(index: number): string | undefined {
  return SHARE_HERO_ORDER[index];
}

/** Bytes needed to hold one bit per hero in the current table. */
export function heroMaskByteLength(): number {
  return Math.ceil(SHARE_HERO_ORDER.length / 8);
}
