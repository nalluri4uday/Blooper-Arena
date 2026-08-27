import { sigmoid } from './sigmoid.js';

export interface NegotiationParams {
  negotiation: number;        // 0-100 attribute
  reputation: number;         // 0-100
  relationshipStrength: number; // 0-1
  strategy: number;           // 0-100
  offerQuality: number;       // 0-1
  counterpartyResistance: number; // 0-1
  rng: number;                // 0-1 seeded random
}

export interface NegotiationResult {
  score: number;
  successProbability: number;
}

/**
 * Calculate a negotiation score and the resulting success probability.
 *
 * Weights:
 *   30% negotiation skill
 *   20% reputation
 *   15% relationship strength
 *   15% strategy
 *   10% offer quality
 *   10% random variance
 *   minus counterparty resistance
 */
export function calculateNegotiationScore(
  params: NegotiationParams,
): NegotiationResult {
  const normalized = {
    negotiation: params.negotiation / 100,
    reputation: params.reputation / 100,
    strategy: params.strategy / 100,
  };

  const score =
    0.30 * normalized.negotiation +
    0.20 * normalized.reputation +
    0.15 * params.relationshipStrength +
    0.15 * normalized.strategy +
    0.10 * params.offerQuality +
    0.10 * params.rng -
    params.counterpartyResistance;

  return {
    score,
    successProbability: sigmoid(score * 5),
  };
}
