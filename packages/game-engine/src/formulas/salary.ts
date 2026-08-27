import { clamp, lerp } from './sigmoid.js';

export interface SalaryParams {
  negotiation: number;
  charisma: number;
  strategy: number;
  level: number;
  reputation: number;
  baseSalaryRange: [number, number]; // [min, max]
  rng: number;
}

export interface SalaryResult {
  salary: number;
  isGoodDeal: boolean; // above 60th percentile of range
}

/**
 * Calculate salary for a job offer based on player attributes.
 *
 * The salary falls within the base range. Higher negotiation, charisma,
 * strategy, level, and reputation push the salary toward the top of the range.
 */
export function calculateSalary(params: SalaryParams): SalaryResult {
  const [minSalary, maxSalary] = params.baseSalaryRange;

  // Attribute contribution to salary position within range (0-1)
  const negotiationFactor = (params.negotiation / 100) * 0.30;
  const charismaFactor = (params.charisma / 100) * 0.20;
  const strategyFactor = (params.strategy / 100) * 0.15;
  const levelFactor = clamp(params.level / 50, 0, 1) * 0.15;
  const reputationFactor = (params.reputation / 100) * 0.10;
  const rngFactor = params.rng * 0.10;

  // Total position within the salary range (0-1)
  const position = clamp(
    negotiationFactor +
    charismaFactor +
    strategyFactor +
    levelFactor +
    reputationFactor +
    rngFactor,
    0,
    1,
  );

  const salary = Math.round(lerp(minSalary, maxSalary, position));
  const isGoodDeal = position >= 0.60;

  return { salary, isGoodDeal };
}
