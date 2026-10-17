/**
 * Overlay rolls are human-paced. A token bucket allows short bursts (a few
 * quick rerolls) and refuses a socket that keeps flooding. The room closes a
 * refused socket rather than dropping the roll: a dropped roll would leave
 * companions on a stale hero, while a closed overlay reconnects and re-sends
 * its current roll.
 */
export const ROLL_BURST = 10;
export const ROLL_REFILL_PER_SECOND = 2;

export interface RollAllowance {
  tokens: number;
  refilledAt: number;
}

/** Spends one token if available, after refilling for the time elapsed. */
export function takeRollToken(
  allowance: RollAllowance,
  now: number,
): { allowed: boolean; next: RollAllowance } {
  const elapsed = Math.max(0, now - allowance.refilledAt) / 1000;
  const tokens = Math.min(
    ROLL_BURST,
    allowance.tokens + elapsed * ROLL_REFILL_PER_SECOND,
  );
  if (tokens < 1) return { allowed: false, next: { tokens, refilledAt: now } };
  return { allowed: true, next: { tokens: tokens - 1, refilledAt: now } };
}
