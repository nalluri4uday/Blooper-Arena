import { sigmoid, clamp } from './sigmoid.js';

export interface RiskParams {
  discipline: number;     // 0-100
  strategy: number;       // 0-100
  reputation: number;     // 0-100
  netWorth: number;
  riskSeverity: number;   // 0-1
  rng: number;            // 0-1
}

export interface RiskResult {
  mitigated: boolean;
  damagePercent: number;    // 0-1, percent of relevant asset affected
  reputationChange: number; // negative = loss, positive = gain (rare)
}

/**
 * Calculate the outcome of a risk event.
 *
 * Higher discipline and strategy increase the chance of mitigating the risk.
 * If not mitigated, damage depends on severity and is partially offset by
 * strategy. Reputation always takes a small hit from risk events, but
 * successful mitigation can limit the damage.
 */
export function calculateRiskOutcome(params: RiskParams): RiskResult {
  const disciplineNorm = params.discipline / 100;
  const strategyNorm = params.strategy / 100;
  const reputationNorm = params.reputation / 100;

  // Mitigation score: how well the player handles the risk
  const mitigationScore =
    0.40 * disciplineNorm +
    0.30 * strategyNorm +
    0.15 * reputationNorm +
    0.15 * params.rng;

  // Compare against severity to determine if mitigated
  const mitigationThreshold = params.riskSeverity * 0.7;
  const mitigated = mitigationScore > mitigationThreshold;

  let damagePercent: number;
  let reputationChange: number;

  if (mitigated) {
    // Partially mitigated: small damage
    damagePercent = clamp(
      params.riskSeverity * 0.15 * (1 - disciplineNorm * 0.5),
      0,
      0.15,
    );
    // Small reputation boost for handling crisis well
    reputationChange = Math.round(clamp(3 * (1 - params.riskSeverity), 0, 5));
  } else {
    // Full impact: severity determines base damage
    const baseDamage = params.riskSeverity * 0.6;
    const strategyReduction = strategyNorm * 0.2;
    damagePercent = clamp(baseDamage - strategyReduction, 0.05, 0.8);

    // Reputation loss proportional to severity
    reputationChange = -Math.round(
      clamp(params.riskSeverity * 15 * (1 - reputationNorm * 0.3), 2, 20),
    );
  }

  return {
    mitigated,
    damagePercent,
    reputationChange,
  };
}
