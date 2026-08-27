import { NetWorthComponents } from './types.js';

/**
 * Calculate total net worth from its components.
 * Net worth = cash + business valuations - debt
 */
export function calculateNetWorth(components: NetWorthComponents): number {
  return components.cash + components.businessValuations - components.debt;
}

/**
 * Check if a player has met the season's target net worth.
 */
export function hasReachedTarget(netWorth: number, targetNetWorth: number): boolean {
  return netWorth >= targetNetWorth;
}

/**
 * Calculate the percentage progress toward the season target.
 * Returns a value between 0 and 1 (can exceed 1 if target is surpassed).
 */
export function calculateProgress(
  currentNetWorth: number,
  startingCapital: number,
  targetNetWorth: number,
): number {
  const totalNeeded = targetNetWorth - startingCapital;
  if (totalNeeded <= 0) return 1;
  const gained = currentNetWorth - startingCapital;
  return Math.max(0, gained / totalNeeded);
}
