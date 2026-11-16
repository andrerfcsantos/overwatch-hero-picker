/**
 * Who may connect to a room and who may roll its overlay. Pure functions, so
 * the rules are tested without the Workers runtime; index.ts applies them.
 */
import {
  controlKeyFor,
  isControlKey,
  isRoomSecret,
  isViewId,
  viewIdFor,
} from "../../../src/lib/rooms/protocol";
import { isRerollDue } from "./rateLimit";

export type Role = "publisher" | "viewer";

export interface Handshake {
  /** The room's name: the view id, also for the overlay. */
  roomName: string;
  role: Role;
  /**
   * For the overlay, the room's control key, worked out from its secret. For
   * a companion, the key it claims to hold, still to be checked by the room.
   */
  control: string | null;
}

/**
 * Reads a socket handshake's room keys. Exactly one of the two: the publish
 * secret (overlay) or the view id (companion). The overlay's room is named by
 * the hash of its secret, so both land in the same room without the view id
 * revealing the secret. A companion may add the control key; the overlay
 * never sends one, since it holds the secret it comes from.
 */
export async function readHandshake(params: {
  secret: string | null;
  view: string | null;
  control: string | null;
}): Promise<Handshake | null> {
  const { secret, view, control } = params;
  if (secret !== null) {
    if (view !== null || control !== null || !isRoomSecret(secret)) {
      return null;
    }
    return {
      roomName: await viewIdFor(secret),
      role: "publisher",
      control: await controlKeyFor(secret),
    };
  }
  if (view === null || !isViewId(view)) return null;
  if (control !== null && !isControlKey(control)) return null;
  return { roomName: view, role: "viewer", control };
}

/**
 * Compares two keys in time that does not depend on where they differ. Over
 * a network the difference would be noise, but it costs nothing.
 */
export function keysMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return difference === 0;
}

/**
 * The control key a companion keeps once it has joined. A key the room knows
 * to be wrong is dropped, so the companion only watches and its messages are
 * refused without a look at storage. A room that has not met its overlay yet
 * cannot tell, so the claim is kept and checked on each roll request.
 */
export function companionControl(
  claimed: string | null,
  expected: string | null,
): string | null {
  if (!claimed) return null;
  if (expected && !keysMatch(claimed, expected)) return null;
  return claimed;
}

export type RerollOutcome = "sent" | "denied" | "offline" | "busy";

/**
 * Whether a roll request goes through to the overlay.
 *
 * A room with no key has never had its overlay connect (or forgot it after a
 * week unused), so no overlay is there to roll: that is "offline", not a bad
 * link, and a Stream Deck user is told to open OBS rather than to fix a link
 * that is fine.
 */
export function rerollOutcome(input: {
  claimed: string | null;
  expected: string | null;
  publishers: number;
  lastRerollAt: number;
  now: number;
}): RerollOutcome {
  if (!input.claimed) return "denied";
  if (!input.expected) return "offline";
  if (!keysMatch(input.claimed, input.expected)) return "denied";
  if (input.publishers === 0) return "offline";
  if (!isRerollDue(input.lastRerollAt, input.now)) return "busy";
  return "sent";
}
