import { sigmoid, clamp } from './sigmoid.js';

export interface InvestmentParams {
  strategy: number;         // 0-100
  discipline: number;       // 0-100
  riskAppetite: number;     // 0-100
  creativity: number;       // 0-100
  reputation: number;       // 0-100
  investmentAmount: number;
  riskLevel: number;        // 0-1 (higher = riskier)
  rng: number;              // 0-1
}

export interface InvestmentResult {
  successProbability: number;
  returnMultiplier: number; // e.g., 1.5 = 50% gain, 0.3 = 70% loss
  netReturn: number;        // actual money change
}

/**
 * Calculate the outcome of an investment.
 *
 * - Higher strategy + discipline improves success probability.
 * - Higher riskAppetite + creativity opens higher return multipliers but with
 *   more variance.
 * - riskLevel modifies the sigmoid curve: higher risk lowers the base success
 *   probability but increases potential returns.
 */
export function calculateInvestmentOutcome(
  params: InvestmentParams,
): InvestmentResult {
  const strategyNorm = params.strategy / 100;
  const disciplineNorm = params.discipline / 100;
  const riskAppetiteNorm = params.riskAppetite / 100;
  const creativityNorm = params.creativity / 100;
  const reputationNorm = params.reputation / 100;

  // Base skill score that determines success probability
  const skillScore =
    0.35 * strategyNorm +
    0.25 * disciplineNorm +
    0.15 * reputationNorm +
    0.10 * creativityNorm +
    0.15 * params.rng;

  // Risk adjustment: higher risk makes success harder
  const riskAdjustedScore = skillScore - params.riskLevel * 0.5;

  // Success probability via sigmoid, steeper curve for riskier investments
  const steepness = 4 + params.riskLevel * 4; // 4-8 range
  const successProbability = clamp(sigmoid(riskAdjustedScore * steepness), 0.02, 0.98);

  // Determine if this particular investment succeeds
  const isSuccess = params.rng < successProbability;

  // Calculate return multiplier
  let returnMultiplier: number;

  if (isSuccess) {
    // Base return: 1.1 to 1.3 for conservative, up to 3.0+ for risky+creative
    const baseReturn = 1.1 + params.riskLevel * 0.5;
    const creativityBonus = creativityNorm * params.riskLevel * 0.8;
    const riskAppetiteBonus = riskAppetiteNorm * params.riskLevel * 0.6;
    const variance = (params.rng - 0.5) * 0.4 * params.riskLevel;

    returnMultiplier = clamp(
      baseReturn + creativityBonus + riskAppetiteBonus + variance,
      1.05,
      4.0,
    );
  } else {
    // Loss: lose 10-90% depending on risk level and discipline
    const disciplineProtection = disciplineNorm * 0.3; // discipline mitigates losses
    const baseLoss = 0.3 + params.riskLevel * 0.5; // 30-80% base loss
    const actualLoss = clamp(baseLoss - disciplineProtection, 0.1, 0.9);

    returnMultiplier = clamp(1 - actualLoss, 0.1, 0.9);
  }

  const netReturn = params.investmentAmount * (returnMultiplier - 1);

  return {
    successProbability,
    returnMultiplier,
    netReturn,
  };
}
