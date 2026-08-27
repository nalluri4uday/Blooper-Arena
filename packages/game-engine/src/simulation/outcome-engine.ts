import { OutcomeInput, OutcomeResult } from './types.js';
import { calculateNegotiationScore } from '../formulas/negotiation.js';
import { calculateInvestmentOutcome } from '../formulas/investment.js';
import { calculateSalary } from '../formulas/salary.js';
import { calculateRiskOutcome } from '../formulas/risk.js';
import { sigmoid, clamp } from '../formulas/sigmoid.js';
import { SeededRNG } from '../random/seeded-rng.js';

/**
 * Create a default "no action" result for REJECT/PASS choices.
 */
function createPassResult(description: string): OutcomeResult {
  return {
    cashDelta: 0,
    reputationDelta: 0,
    influenceDelta: 0,
    energyCost: 0,
    experienceGained: 5,
    description,
    ledgerType: 'event_reward',
    isSuccess: true,
  };
}

/**
 * Resolve a job offer outcome.
 */
function resolveJobOffer(input: OutcomeInput): OutcomeResult {
  const { opportunity, choice, player, rng } = input;
  const payload = opportunity.payload;

  if (choice === 'REJECT') {
    return createPassResult(`Declined the ${payload.role} position at ${payload.company}.`);
  }

  const salaryRange = (payload.baseSalaryRange as [number, number]) ?? [30000, 80000];
  const rngValue = rng.random();

  const salaryResult = calculateSalary({
    negotiation: player.attributes.negotiation,
    charisma: player.attributes.charisma,
    strategy: player.attributes.strategy,
    level: player.level,
    reputation: player.reputation,
    baseSalaryRange: salaryRange,
    rng: rngValue,
  });

  if (choice === 'NEGOTIATE') {
    // Negotiation attempt: higher risk, higher reward
    const negotiationResult = calculateNegotiationScore({
      negotiation: player.attributes.negotiation,
      reputation: player.reputation,
      relationshipStrength: 0.3, // new employer, low relationship
      strategy: player.attributes.strategy,
      offerQuality: 0.7,
      counterpartyResistance: 0.5,
      rng: rngValue,
    });

    if (rng.chance(negotiationResult.successProbability)) {
      // Successful negotiation: 15-30% above base salary
      const bonus = 1.15 + rng.random() * 0.15;
      const negotiatedSalary = Math.round(salaryResult.salary * bonus);
      return {
        cashDelta: negotiatedSalary,
        reputationDelta: 3,
        influenceDelta: 1,
        energyCost: 6,
        experienceGained: 30,
        description: `Successfully negotiated a ${payload.role} salary of $${negotiatedSalary.toLocaleString()} at ${payload.company} -- above their initial offer!`,
        ledgerType: 'salary',
        isSuccess: true,
      };
    } else {
      // Failed negotiation: they may rescind or offer lower
      if (rng.chance(0.3)) {
        return {
          cashDelta: 0,
          reputationDelta: -2,
          influenceDelta: 0,
          energyCost: 6,
          experienceGained: 15,
          description: `Your aggressive negotiation for the ${payload.role} role at ${payload.company} backfired -- they rescinded the offer.`,
          ledgerType: 'event_penalty',
          isSuccess: false,
        };
      }
      // Reduced offer
      const reducedSalary = Math.round(salaryResult.salary * 0.9);
      return {
        cashDelta: reducedSalary,
        reputationDelta: -1,
        influenceDelta: 0,
        energyCost: 6,
        experienceGained: 20,
        description: `Your negotiation attempt for ${payload.role} at ${payload.company} fell flat. Accepted a reduced offer of $${reducedSalary.toLocaleString()}.`,
        ledgerType: 'salary',
        isSuccess: false,
      };
    }
  }

  // ACCEPT: standard salary
  return {
    cashDelta: salaryResult.salary,
    reputationDelta: 1,
    influenceDelta: 1,
    energyCost: 3,
    experienceGained: 20,
    description: `Accepted the ${payload.role} position at ${payload.company} for $${salaryResult.salary.toLocaleString()}.${salaryResult.isGoodDeal ? ' Great deal!' : ''}`,
    ledgerType: 'salary',
    isSuccess: true,
  };
}

/**
 * Resolve an investment outcome.
 */
function resolveInvestment(input: OutcomeInput): OutcomeResult {
  const { opportunity, choice, player, rng } = input;
  const payload = opportunity.payload;

  if (choice === 'REJECT' || choice === 'PASS') {
    return createPassResult(`Passed on the ${payload.sector} investment opportunity via ${payload.company}.`);
  }

  const riskLevel = (payload.riskLevel as number) ?? 0.5;
  const investmentAmount = Math.min(
    (payload.maxInvestment as number) ?? player.cash * 0.3,
    player.cash * 0.4,
  );

  if (investmentAmount <= 0) {
    return {
      cashDelta: 0,
      reputationDelta: 0,
      influenceDelta: 0,
      energyCost: 3,
      experienceGained: 5,
      description: `Unable to invest in ${payload.company} -- insufficient funds.`,
      ledgerType: 'event_penalty',
      isSuccess: false,
    };
  }

  const result = calculateInvestmentOutcome({
    strategy: player.attributes.strategy,
    discipline: player.attributes.discipline,
    riskAppetite: player.attributes.riskAppetite,
    creativity: player.attributes.creativity,
    reputation: player.reputation,
    investmentAmount,
    riskLevel,
    rng: rng.random(),
  });

  const isSuccess = result.netReturn > 0;
  const absReturn = Math.abs(Math.round(result.netReturn));

  return {
    cashDelta: Math.round(result.netReturn),
    reputationDelta: isSuccess ? 2 : -1,
    influenceDelta: isSuccess ? 1 : 0,
    energyCost: riskLevel > 0.5 ? 8 : 3,
    experienceGained: isSuccess ? 25 : 15,
    description: isSuccess
      ? `Your ${payload.sector} investment in ${payload.company} returned $${absReturn.toLocaleString()} (${Math.round((result.returnMultiplier - 1) * 100)}% gain).`
      : `Your ${payload.sector} investment in ${payload.company} lost $${absReturn.toLocaleString()} (${Math.round((1 - result.returnMultiplier) * 100)}% loss).`,
    ledgerType: isSuccess ? 'investment_return' : 'event_penalty',
    isSuccess,
  };
}

/**
 * Resolve a partnership outcome.
 */
function resolvePartnership(input: OutcomeInput): OutcomeResult {
  const { opportunity, choice, player, rng } = input;
  const payload = opportunity.payload;

  if (choice === 'REJECT') {
    return createPassResult(`Declined the partnership proposal from ${payload.partnerName} at ${payload.company}.`);
  }

  const partnerReputation = (payload.partnerReputation as number) ?? 50;
  const relationships = input.relationships ?? new Map<string, number>();
  const relationshipStrength = relationships.get(payload.partnerName as string) ?? 0.2;

  const negotiationResult = calculateNegotiationScore({
    negotiation: player.attributes.negotiation,
    reputation: player.reputation,
    relationshipStrength,
    strategy: player.attributes.strategy,
    offerQuality: 0.6,
    counterpartyResistance: (100 - partnerReputation) / 200,
    rng: rng.random(),
  });

  if (choice === 'NEGOTIATE') {
    // Attempt to negotiate better terms
    if (rng.chance(negotiationResult.successProbability)) {
      const cashGain = Math.round(player.netWorth * 0.05 * rng.random());
      return {
        cashDelta: cashGain,
        reputationDelta: 4,
        influenceDelta: 3,
        energyCost: 6,
        experienceGained: 35,
        description: `Negotiated a favorable partnership deal with ${payload.partnerName} at ${payload.company}. Gained $${cashGain.toLocaleString()} upfront with a ${(payload.proposedSplit as number) + 5}/${100 - (payload.proposedSplit as number) - 5} revenue split in your favor.`,
        ledgerType: 'negotiation_gain',
        relationshipChanges: [{
          targetId: payload.partnerName as string,
          strengthDelta: 0.15,
          trustDelta: 0.1,
        }],
        isSuccess: true,
      };
    } else {
      return {
        cashDelta: 0,
        reputationDelta: -2,
        influenceDelta: -1,
        energyCost: 6,
        experienceGained: 15,
        description: `${payload.partnerName} walked away after your aggressive counter-proposal. The partnership at ${payload.company} fell through.`,
        ledgerType: 'negotiation_loss',
        relationshipChanges: [{
          targetId: payload.partnerName as string,
          strengthDelta: -0.1,
          trustDelta: -0.15,
        }],
        isSuccess: false,
      };
    }
  }

  // ACCEPT: standard partnership
  const cashGain = Math.round(player.netWorth * 0.02 * rng.random());
  return {
    cashDelta: cashGain,
    reputationDelta: 2,
    influenceDelta: 2,
    energyCost: 3,
    experienceGained: 20,
    description: `Formed a partnership with ${payload.partnerName} at ${payload.company} with a ${payload.proposedSplit}/${100 - (payload.proposedSplit as number)} split. Gained $${cashGain.toLocaleString()}.`,
    ledgerType: 'negotiation_gain',
    relationshipChanges: [{
      targetId: payload.partnerName as string,
      strengthDelta: 0.1,
      trustDelta: 0.05,
    }],
    isSuccess: true,
  };
}

/**
 * Resolve a market event outcome.
 */
function resolveMarketEvent(input: OutcomeInput): OutcomeResult {
  const { opportunity, player, rng } = input;
  const payload = opportunity.payload;
  const direction = payload.direction as string;
  const magnitude = (payload.magnitude as number) ?? 0.1;

  // Market events are passive -- they affect existing holdings
  const portfolioImpact = player.netWorth * magnitude * (direction === 'up' ? 1 : -1);
  const disciplineModifier = player.attributes.discipline / 100;

  // Disciplined players reduce losses and slightly amplify gains
  const adjustedImpact = direction === 'down'
    ? portfolioImpact * (1 - disciplineModifier * 0.3)
    : portfolioImpact * (1 + disciplineModifier * 0.1);

  const roundedImpact = Math.round(adjustedImpact);
  const isPositive = roundedImpact > 0;

  return {
    cashDelta: roundedImpact,
    reputationDelta: 0,
    influenceDelta: 0,
    energyCost: 0,
    experienceGained: 10,
    description: `${payload.sector} market ${direction === 'up' ? 'surged' : 'dropped'} ${Math.round(magnitude * 100)}%. Your portfolio ${isPositive ? 'gained' : 'lost'} $${Math.abs(roundedImpact).toLocaleString()}.`,
    ledgerType: isPositive ? 'event_reward' : 'event_penalty',
    isSuccess: isPositive,
  };
}

/**
 * Resolve a business opportunity outcome.
 */
function resolveBusinessOpportunity(input: OutcomeInput): OutcomeResult {
  const { opportunity, choice, player, rng } = input;
  const payload = opportunity.payload;

  if (choice === 'REJECT' || choice === 'PASS') {
    return createPassResult(`Passed on launching a ${payload.businessType}.`);
  }

  const startupCost = (payload.startupCost as number) ?? 50000;

  if (player.cash < startupCost) {
    return {
      cashDelta: 0,
      reputationDelta: 0,
      influenceDelta: 0,
      energyCost: 3,
      experienceGained: 5,
      description: `Cannot afford the $${startupCost.toLocaleString()} startup cost for ${payload.name}.`,
      ledgerType: 'event_penalty',
      isSuccess: false,
    };
  }

  // Success probability based on strategy and creativity
  const successScore =
    0.35 * (player.attributes.strategy / 100) +
    0.25 * (player.attributes.creativity / 100) +
    0.15 * (player.attributes.discipline / 100) +
    0.10 * (player.reputation / 100) +
    0.15 * rng.random();

  const isSuccess = rng.chance(sigmoid(successScore * 4));

  if (isSuccess) {
    const valuation = Math.round(startupCost * (1.2 + rng.random() * 0.8));
    return {
      cashDelta: -startupCost,
      reputationDelta: 5,
      influenceDelta: 3,
      energyCost: 15,
      experienceGained: 50,
      description: `Successfully launched ${payload.name}! Initial valuation: $${valuation.toLocaleString()}.`,
      ledgerType: 'business_expense',
      newBusiness: {
        name: payload.name as string,
        type: payload.businessType as string,
        valuation,
      },
      isSuccess: true,
    };
  } else {
    // Partial loss on failure
    const lostAmount = Math.round(startupCost * 0.6);
    return {
      cashDelta: -lostAmount,
      reputationDelta: -2,
      influenceDelta: -1,
      energyCost: 15,
      experienceGained: 20,
      description: `Your attempt to launch ${payload.name} encountered obstacles. Lost $${lostAmount.toLocaleString()} in preliminary costs.`,
      ledgerType: 'business_expense',
      isSuccess: false,
    };
  }
}

/**
 * Resolve a risk event outcome.
 */
function resolveRiskEvent(input: OutcomeInput): OutcomeResult {
  const { opportunity, choice, player, rng } = input;
  const payload = opportunity.payload;
  const severity = (payload.severity as number) ?? 0.5;

  // Risk events don't have REJECT -- player must respond
  const choiceKey = choice === 'MITIGATE' || choice === 'ACCEPT' ? choice : 'ACCEPT';

  const riskResult = calculateRiskOutcome({
    discipline: player.attributes.discipline,
    strategy: player.attributes.strategy,
    reputation: player.reputation,
    netWorth: player.netWorth,
    riskSeverity: choiceKey === 'MITIGATE' ? severity * 0.7 : severity,
    rng: rng.random(),
  });

  const damageAmount = Math.round(player.netWorth * riskResult.damagePercent);

  return {
    cashDelta: -damageAmount,
    reputationDelta: riskResult.reputationChange,
    influenceDelta: riskResult.mitigated ? 1 : -2,
    energyCost: choiceKey === 'MITIGATE' ? 8 : 3,
    experienceGained: riskResult.mitigated ? 30 : 15,
    description: riskResult.mitigated
      ? `Successfully mitigated ${payload.event}. Limited damage to $${damageAmount.toLocaleString()}.`
      : `${payload.event} hit hard. Lost $${damageAmount.toLocaleString()} (${Math.round(riskResult.damagePercent * 100)}% impact).`,
    ledgerType: 'event_penalty',
    isSuccess: riskResult.mitigated,
  };
}

/**
 * Resolve a skill challenge outcome.
 */
function resolveSkillChallenge(input: OutcomeInput): OutcomeResult {
  const { opportunity, choice, player, rng } = input;
  const payload = opportunity.payload;

  if (choice === 'REJECT' || choice === 'PASS') {
    return createPassResult(`Skipped the ${payload.challenge}.`);
  }

  const primaryAttr = payload.primaryAttribute as string;
  const difficulty = payload.difficulty as string;

  // Get the relevant attribute value
  const attrKey = primaryAttr as keyof typeof player.attributes;
  const primaryValue = player.attributes[attrKey] ?? 50;

  // Difficulty multiplier
  const difficultyThreshold: Record<string, number> = {
    easy: 0.3,
    medium: 0.5,
    hard: 0.7,
    expert: 0.85,
  };
  const threshold = difficultyThreshold[difficulty] ?? 0.5;

  // Composite score
  const score =
    0.50 * (primaryValue / 100) +
    0.15 * (player.attributes.discipline / 100) +
    0.10 * (player.attributes.strategy / 100) +
    0.10 * (player.reputation / 100) +
    0.15 * rng.random();

  const isSuccess = score > threshold;
  const cashPrize = (payload.cashPrize as number) ?? 5000;
  const reputationReward = (payload.reputationReward as number) ?? 5;

  if (isSuccess) {
    return {
      cashDelta: cashPrize,
      reputationDelta: reputationReward,
      influenceDelta: 2,
      energyCost: 5,
      experienceGained: 40,
      description: `Won the ${payload.challenge}! Earned $${cashPrize.toLocaleString()} and boosted your reputation.`,
      ledgerType: 'event_reward',
      isSuccess: true,
    };
  }

  return {
    cashDelta: 0,
    reputationDelta: Math.max(1, Math.round(reputationReward * 0.3)),
    influenceDelta: 0,
    energyCost: 5,
    experienceGained: 20,
    description: `Participated in the ${payload.challenge} but didn't place. Gained some exposure.`,
    ledgerType: 'event_reward',
    isSuccess: false,
  };
}

/**
 * Resolve a social event outcome.
 */
function resolveSocialEvent(input: OutcomeInput): OutcomeResult {
  const { opportunity, choice, player, rng } = input;
  const payload = opportunity.payload;

  if (choice === 'REJECT' || choice === 'PASS') {
    return createPassResult(`Skipped the ${payload.event}.`);
  }

  const attendees = (payload.attendees as string[]) ?? [];
  const networkingQuality = payload.networkingQuality as string;
  const reputationBonus = (payload.reputationBonus as number) ?? 2;

  // Charisma determines how well networking goes
  const charismaScore = player.attributes.charisma / 100;
  const qualityMultiplier: Record<string, number> = {
    low: 0.5,
    medium: 1.0,
    high: 1.5,
  };
  const multiplier = qualityMultiplier[networkingQuality] ?? 1.0;

  const effectiveBonus = Math.round(reputationBonus * multiplier * (0.5 + charismaScore * 0.5));

  // Build relationships with attendees
  const relationshipChanges = attendees.map((attendee) => ({
    targetId: attendee,
    strengthDelta: 0.05 + charismaScore * 0.1 * multiplier,
    trustDelta: 0.03 + charismaScore * 0.05,
  }));

  return {
    cashDelta: 0,
    reputationDelta: effectiveBonus,
    influenceDelta: Math.round(attendees.length * 0.5),
    energyCost: 2,
    experienceGained: 15,
    description: `Attended the ${payload.event}. Met ${attendees.length} contacts and boosted your reputation by ${effectiveBonus}.`,
    ledgerType: 'event_reward',
    relationshipChanges,
    isSuccess: true,
  };
}

/**
 * Resolve the outcome of a player's choice on an opportunity.
 *
 * Routes to the appropriate resolver based on opportunity type:
 * - job_offer: ACCEPT gives recurring salary, NEGOTIATE may get higher salary or fail
 * - investment: ACCEPT risks money for potential multiplied returns
 * - partnership: Requires negotiation formula, affects relationships
 * - market_event: Passive effects based on portfolio/businesses
 * - business_launch: Costs money upfront, creates a business entity
 * - risk_event: Discipline/strategy mitigate damage
 * - skill_challenge: Attribute-based success check, reputation rewards
 * - social_event: Builds relationships, costs energy, small reputation gains
 */
export function resolveOutcome(input: OutcomeInput): OutcomeResult {
  switch (input.opportunity.type) {
    case 'job_offer':
      return resolveJobOffer(input);

    case 'investment':
      return resolveInvestment(input);

    case 'partnership':
    case 'negotiation':
      return resolvePartnership(input);

    case 'market_event':
      return resolveMarketEvent(input);

    case 'business_launch':
    case 'business_opportunity':
      return resolveBusinessOpportunity(input);

    case 'risk_event':
      return resolveRiskEvent(input);

    case 'skill_challenge':
      return resolveSkillChallenge(input);

    case 'social_event':
      return resolveSocialEvent(input);

    default:
      return createPassResult(`No resolver for event type: ${input.opportunity.type}`);
  }
}
