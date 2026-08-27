import { EnergyState } from './types.js';

const REPLENISHMENT_INTERVAL_MS = 6 * 60 * 1000; // 1 energy every 6 minutes

/**
 * Calculate the current energy level based on time elapsed since last
 * replenishment. Accrues 1 energy per 6 minutes, capped at max.
 */
export function calculateCurrentEnergy(state: EnergyState, now: Date): number {
  const elapsedMs = now.getTime() - state.lastReplenishedAt.getTime();

  if (elapsedMs <= 0) {
    return state.current;
  }

  const energyGained = Math.floor(elapsedMs / REPLENISHMENT_INTERVAL_MS);
  return Math.min(state.current + energyGained, state.max);
}

/**
 * Check whether the player has enough energy for an action.
 */
export function canAffordAction(energy: number, cost: number): boolean {
  return energy >= cost;
}

/**
 * Deduct energy for an action. Throws if insufficient.
 */
export function deductEnergy(current: number, cost: number): number {
  if (current < cost) {
    throw new Error(
      `Insufficient energy: have ${current}, need ${cost}`,
    );
  }
  return current - cost;
}

/**
 * Calculate how many energy points would be replenished over a given
 * number of milliseconds.
 */
export function calculateReplenishment(elapsedMs: number, max: number, current: number): number {
  if (elapsedMs <= 0) return 0;
  const gained = Math.floor(elapsedMs / REPLENISHMENT_INTERVAL_MS);
  return Math.min(gained, max - current);
}
