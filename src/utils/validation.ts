/**
 * Validates that a submitted score is legitimate.
 * Used both client-side (for UI) and server-side (for anti-cheat).
 *
 * Rules:
 * - Score must be integer 1-30
 * - HP must be integer 1-20
 * - Score >= HP (score is HP + optional potion bonus)
 * - If score > 20, HP must be 20 (potion bonus only at full HP)
 * - Potion bonus cannot exceed 10 (max potion value)
 */
export function validateScore(score: number, hpRemaining: number): boolean {
  if (!Number.isInteger(score) || score < 1 || score > 30) return false;
  if (!Number.isInteger(hpRemaining) || hpRemaining < 1 || hpRemaining > 20) return false;
  if (score < hpRemaining) return false;
  if (score > 20 && hpRemaining !== 20) return false;
  if (score - hpRemaining > 10) return false;
  return true;
}
