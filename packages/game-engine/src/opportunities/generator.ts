import { EventRule } from '../rules/types.js';
import { SeededRNG } from '../random/seeded-rng.js';
import { clamp } from '../formulas/sigmoid.js';
import { PlayerContext, GeneratedOpportunity } from './types.js';
import {
  COMPANY_NAMES,
  INVESTMENT_SECTORS,
  JOB_ROLES,
  BUSINESS_TYPES,
  RISK_EVENTS,
  SKILL_CHALLENGES,
  SOCIAL_EVENTS,
  PARTNER_NAMES,
} from './registry.js';

const DEFAULT_MAX_OPPORTUNITIES = 3;
const DEFAULT_EXPIRY_HOURS = 4;

/**
 * Check if a player is eligible for a given event rule.
 */
function checkEligibility(player: PlayerContext, rule: EventRule): boolean {
  const elig = rule.eligibility;

  if (elig.minLevel !== undefined && player.level < elig.minLevel) {
    return false;
  }
  if (elig.minEnergy !== undefined && player.energy < elig.minEnergy) {
    return false;
  }
  if (elig.maxActiveBusinesses !== undefined && player.activeBusinessCount > elig.maxActiveBusinesses) {
    return false;
  }
  if (elig.minReputation !== undefined && player.reputation < elig.minReputation) {
    return false;
  }
  if (elig.minCash !== undefined && player.cash < elig.minCash) {
    return false;
  }

  return true;
}

/**
 * Check if an event type is on cooldown.
 */
function isOnCooldown(
  eventType: string,
  cooldowns: Map<string, Date>,
  cooldownHours: number | undefined,
  now: Date,
): boolean {
  if (cooldownHours === undefined || cooldownHours <= 0) return false;

  const lastGenerated = cooldowns.get(eventType);
  if (!lastGenerated) return false;

  const cooldownMs = cooldownHours * 60 * 60 * 1000;
  return now.getTime() - lastGenerated.getTime() < cooldownMs;
}

/**
 * Calculate the generation probability for a rule, accounting for
 * attribute modifiers.
 */
function calculateProbability(
  rule: EventRule,
  player: PlayerContext,
): number {
  let probability = rule.generation.baseProbability;

  for (const [attr, modifier] of Object.entries(rule.generation.modifiers)) {
    const attrKey = attr as keyof typeof player.attributes;
    const attrValue = player.attributes[attrKey];
    if (attrValue !== undefined) {
      // Modifier scales with attribute: a modifier of 0.1 with attr 80 adds 0.08
      probability += modifier * (attrValue / 100);
    }
  }

  return clamp(probability, 0.01, 0.95);
}

/**
 * Calculate the minimum energy cost across all choices for an event.
 */
function getMinEnergyCost(rule: EventRule): number {
  if (rule.choices.length === 0) return 0;
  return Math.min(...rule.choices.map((c) => c.energyCost));
}

/**
 * Generate a payload based on the event type.
 * Creates contextual data using the template registry.
 */
function generatePayload(
  type: string,
  player: PlayerContext,
  rng: SeededRNG,
): Record<string, unknown> {
  const payloadRng = rng.fork(`payload:${type}`);

  switch (type) {
    case 'job_offer': {
      const company = payloadRng.pick([...COMPANY_NAMES]);
      const role = payloadRng.pick([...JOB_ROLES]);
      const baseSalary = 30000 + player.level * 5000;
      const maxSalary = baseSalary * 2.5;
      return {
        company,
        role,
        baseSalaryRange: [baseSalary, Math.round(maxSalary)],
        sector: payloadRng.pick([...INVESTMENT_SECTORS]),
      };
    }

    case 'investment': {
      const sector = payloadRng.pick([...INVESTMENT_SECTORS]);
      const company = payloadRng.pick([...COMPANY_NAMES]);
      const riskLevel = payloadRng.random() * 0.8 + 0.1; // 0.1 to 0.9
      const minInvestment = Math.round(player.cash * 0.05);
      const maxInvestment = Math.round(player.cash * 0.4);
      return {
        sector,
        company,
        riskLevel: Math.round(riskLevel * 100) / 100,
        minInvestment: Math.max(1000, minInvestment),
        maxInvestment: Math.max(5000, maxInvestment),
        description: `Investment opportunity in ${sector} via ${company}`,
      };
    }

    case 'partnership': {
      const partner = payloadRng.pick([...PARTNER_NAMES]);
      const company = payloadRng.pick([...COMPANY_NAMES]);
      const partnerReputation = payloadRng.randomInt(30, 90);
      return {
        partnerName: partner,
        company,
        partnerReputation,
        proposedSplit: payloadRng.pick([40, 45, 50, 55, 60]),
        sector: payloadRng.pick([...INVESTMENT_SECTORS]),
      };
    }

    case 'market_event': {
      const sector = payloadRng.pick([...INVESTMENT_SECTORS]);
      const magnitude = payloadRng.random() * 0.3 + 0.05; // 5-35%
      const isPositive = payloadRng.chance(0.5);
      return {
        sector,
        magnitude: Math.round(magnitude * 100) / 100,
        direction: isPositive ? 'up' : 'down',
        description: `${sector} market ${isPositive ? 'surge' : 'downturn'}`,
      };
    }

    case 'business_launch': {
      const businessType = payloadRng.pick([...BUSINESS_TYPES]);
      const startupCost = Math.round(
        (10000 + player.level * 8000) * (0.8 + payloadRng.random() * 0.4),
      );
      return {
        businessType,
        name: `${payloadRng.pick([...COMPANY_NAMES])} ${businessType.split(' ')[0]}`,
        startupCost,
        estimatedMonthlyRevenue: Math.round(startupCost * 0.15),
        estimatedMonthlyExpenses: Math.round(startupCost * 0.08),
        sector: payloadRng.pick([...INVESTMENT_SECTORS]),
      };
    }

    case 'risk_event': {
      const event = payloadRng.pick([...RISK_EVENTS]);
      const severity = payloadRng.random() * 0.7 + 0.1; // 0.1 to 0.8
      return {
        event,
        severity: Math.round(severity * 100) / 100,
        description: `${event} threatens your operations`,
        potentialDamage: Math.round(player.netWorth * severity * 0.2),
      };
    }

    case 'skill_challenge': {
      const challenge = payloadRng.pick([...SKILL_CHALLENGES]);
      const primaryAttribute = payloadRng.pick([
        'strategy', 'negotiation', 'charisma', 'discipline', 'creativity',
      ]);
      const reputationReward = payloadRng.randomInt(3, 12);
      return {
        challenge,
        primaryAttribute,
        reputationReward,
        difficulty: payloadRng.pick(['easy', 'medium', 'hard', 'expert']),
        cashPrize: payloadRng.randomInt(1, 5) * 1000 * player.level,
      };
    }

    case 'social_event': {
      const event = payloadRng.pick([...SOCIAL_EVENTS]);
      const attendees = payloadRng.shuffle([...PARTNER_NAMES]).slice(0, payloadRng.randomInt(2, 5));
      return {
        event,
        attendees,
        reputationBonus: payloadRng.randomInt(1, 5),
        networkingQuality: payloadRng.pick(['low', 'medium', 'high']),
      };
    }

    default:
      return { type, description: `Unknown event type: ${type}` };
  }
}

/**
 * Calculate the importance of an opportunity based on the rule and player context.
 */
function calculateImportance(
  rule: EventRule,
  player: PlayerContext,
  payload: Record<string, unknown>,
): number {
  let importance = rule.importance.base;

  if (rule.importance.modifiers) {
    for (const [attr, mod] of Object.entries(rule.importance.modifiers)) {
      const attrKey = attr as keyof typeof player.attributes;
      const attrValue = player.attributes[attrKey];
      if (attrValue !== undefined) {
        importance += mod * (attrValue / 100);
      }
    }
  }

  // Boost importance for high-value opportunities
  if (payload.riskLevel && typeof payload.riskLevel === 'number') {
    importance += payload.riskLevel * 10;
  }
  if (payload.severity && typeof payload.severity === 'number') {
    importance += payload.severity * 15;
  }

  return clamp(Math.round(importance), 1, 100);
}

/**
 * Generate opportunities for a player based on event rules and RNG.
 *
 * For each rule:
 * 1. Check eligibility (level, energy, business count, etc.)
 * 2. Check cooldown
 * 3. Calculate generation probability (base + attribute modifiers)
 * 4. Use RNG to decide if opportunity is generated
 * 5. Generate payload with contextual data
 * 6. Calculate importance
 *
 * Returns generated opportunities capped at maxOpportunities (default 3).
 */
export function generateOpportunities(
  player: PlayerContext,
  rules: EventRule[],
  rng: SeededRNG,
  now: Date,
  maxOpportunities?: number,
): GeneratedOpportunity[] {
  const max = maxOpportunities ?? DEFAULT_MAX_OPPORTUNITIES;
  const opportunities: GeneratedOpportunity[] = [];

  // Shuffle rules so generation order is non-deterministic relative to definition
  const shuffledRules = rng.shuffle(rules);

  for (const rule of shuffledRules) {
    if (opportunities.length >= max) break;

    // 1. Check eligibility
    if (!checkEligibility(player, rule)) continue;

    // 2. Check cooldown
    if (isOnCooldown(rule.type, player.cooldowns, rule.generation.cooldownHours, now)) {
      continue;
    }

    // 3. Calculate probability with attribute modifiers
    const probability = calculateProbability(rule, player);

    // 4. Roll for generation
    const eventRng = rng.fork(`gen:${rule.type}`);
    if (!eventRng.chance(probability)) continue;

    // 5. Generate payload
    const payload = generatePayload(rule.type, player, eventRng);

    // 6. Calculate importance
    const importance = calculateImportance(rule, player, payload);

    const expiresAt = new Date(now.getTime() + DEFAULT_EXPIRY_HOURS * 60 * 60 * 1000);

    opportunities.push({
      id: `opp_${player.characterId}_${now.getTime()}_${rule.type}`,
      seasonId: player.seasonId,
      characterId: player.characterId,
      type: rule.type,
      importance,
      energyCost: getMinEnergyCost(rule),
      payload,
      expiresAt,
    });
  }

  // Sort by importance descending so most important are first
  opportunities.sort((a, b) => b.importance - a.importance);

  return opportunities;
}
