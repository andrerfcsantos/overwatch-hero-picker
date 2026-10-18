/**
 * Wire protocol between the stream overlay, the rooms Worker
 * (workers/rooms) and the companion page.
 *
 * A room has two names. The overlay holds a random *publish secret* and is
 * the only one that can post rolls. Viewers use the room's *view id*, the
 * SHA-256 of that secret, so a companion link can be shared — with a second
 * screen, a phone, a moderator — without letting anyone post fake rolls.
 *
 * This module is imported by the Worker too, so it must stay free of path
 * aliases and of browser- or Node-only APIs (Web Crypto is in both).
 */

/** Overlay link parameter carrying the publish secret. */
export const ROOM_PUBLISH_PARAM = "room";
/** Companion link parameter carrying the view id. */
export const ROOM_VIEW_PARAM = "view";

/** 24 random bytes, base64url: 32 characters. Longer secrets are accepted. */
const SECRET_BYTES = 24;
const SECRET_PATTERN = /^[A-Za-z0-9_-]{32,64}$/;
/** A SHA-256 digest in unpadded base64url is always 43 characters. */
const VIEW_ID_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/** Random per roll, so a re-sent roll is recognised as the same one. */
const ROLL_ID_BYTES = 9;
const ROLL_ID_PATTERN = /^[A-Za-z0-9_-]{8,32}$/;

/** Hero keys are short lowercase slugs ("ana", "soldier76", "junker-queen"). */
const HERO_KEY_PATTERN = /^[a-z0-9_-]{1,32}$/;
/** Perk indices index short lists; anything past this is garbage. */
const MAX_PERK_INDEX = 31;

/** Messages are tiny; anything larger is a bug or abuse. */
export const MAX_MESSAGE_BYTES = 1024;

/**
 * Close code the room uses when a newer overlay takes this one's place. The
 * replaced overlay must not reconnect, or two overlays would keep replacing
 * each other.
 */
export const REPLACED_CLOSE_CODE = 4001;

/** Sent by clients to keep the socket alive; answered without waking the room. */
export const PING_MESSAGE = '{"type":"ping"}';
export const PONG_MESSAGE = '{"type":"pong"}';

export interface RoomPerks {
  minor: number;
  major: number;
}

export interface RoomRoll {
  /**
   * Chosen by the overlay for each roll. The overlay re-sends its current roll
   * whenever it reconnects; the room uses the id to tell that apart from a new
   * roll, so the roll keeps its time and companions do not replay it.
   */
  id: string;
  heroKey: string;
  /** Null when the overlay does not show perks. */
  perks: RoomPerks | null;
  /** Server time (ms since epoch) when the room received the roll. */
  rolledAt: number;
}

/** Overlay → room. */
export type PublisherMessage = {
  type: "roll";
  roll: Pick<RoomRoll, "id" | "heroKey" | "perks">;
};

/** Room → companion. */
export type ViewerMessage =
  | { type: "state"; roll: RoomRoll | null; overlayOnline: boolean }
  | { type: "roll"; roll: RoomRoll }
  | { type: "presence"; overlayOnline: boolean };

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateRoomSecret(): string {
  const bytes = new Uint8Array(SECRET_BYTES);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

export function generateRollId(): string {
  const bytes = new Uint8Array(ROLL_ID_BYTES);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

export function isRoomSecret(value: unknown): value is string {
  return typeof value === "string" && SECRET_PATTERN.test(value);
}

export function isViewId(value: unknown): value is string {
  return typeof value === "string" && VIEW_ID_PATTERN.test(value);
}

/** The view id for a publish secret. */
export async function viewIdFor(secret: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret),
  );
  return base64Url(new Uint8Array(digest));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPerkIndex(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= MAX_PERK_INDEX
  );
}

function readPerks(value: unknown): RoomPerks | null | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;
  if (!isPerkIndex(value.minor) || !isPerkIndex(value.major)) return undefined;
  return { minor: value.minor, major: value.major };
}

/** The hero and perks of a roll, or undefined when malformed. */
function readRollBody(value: unknown): PublisherMessage["roll"] | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value.id !== "string" || !ROLL_ID_PATTERN.test(value.id)) {
    return undefined;
  }
  if (typeof value.heroKey !== "string") return undefined;
  if (!HERO_KEY_PATTERN.test(value.heroKey)) return undefined;
  const perks = readPerks(value.perks);
  if (perks === undefined) return undefined;
  return { id: value.id, heroKey: value.heroKey, perks };
}

function readRoll(value: unknown): RoomRoll | undefined {
  const body = readRollBody(value);
  if (!body || !isRecord(value)) return undefined;
  const { rolledAt } = value;
  if (typeof rolledAt !== "number" || !Number.isFinite(rolledAt)) {
    return undefined;
  }
  return { ...body, rolledAt };
}

function parseJson(raw: string): unknown {
  if (raw.length > MAX_MESSAGE_BYTES) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/** Validates a message from the overlay. Returns null when it is not one. */
export function parsePublisherMessage(raw: string): PublisherMessage | null {
  const value = parseJson(raw);
  if (!isRecord(value) || value.type !== "roll") return null;
  const roll = readRollBody(value.roll);
  return roll ? { type: "roll", roll } : null;
}

/** Validates a message from the room. Returns null when it is not one. */
export function parseViewerMessage(raw: string): ViewerMessage | null {
  const value = parseJson(raw);
  if (!isRecord(value)) return null;
  switch (value.type) {
    case "state": {
      if (typeof value.overlayOnline !== "boolean") return null;
      if (value.roll === null) {
        return {
          type: "state",
          roll: null,
          overlayOnline: value.overlayOnline,
        };
      }
      const roll = readRoll(value.roll);
      return roll
        ? { type: "state", roll, overlayOnline: value.overlayOnline }
        : null;
    }
    case "roll": {
      const roll = readRoll(value.roll);
      return roll ? { type: "roll", roll } : null;
    }
    case "presence":
      return typeof value.overlayOnline === "boolean"
        ? { type: "presence", overlayOnline: value.overlayOnline }
        : null;
    default:
      return null;
  }
}

export function publisherRollMessage(
  id: string,
  heroKey: string,
  perks: RoomPerks | null,
): string {
  const message: PublisherMessage = {
    type: "roll",
    roll: { id, heroKey, perks },
  };
  return JSON.stringify(message);
}
