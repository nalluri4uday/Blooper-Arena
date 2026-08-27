import {
  TickInput,
  TickOutput,
  TickLedgerEntry,
  TickEvent,
  BusinessUpdate,
} from './types.js';
import { calculateReplenishment } from '../energy/energy-manager.js';
import { generateOpportunities } from '../opportunities/generator.js';
import { PlayerContext } from '../opportunities/types.js';
import { clamp } from '../formulas/sigmoid.js';
import type { SeededRNG } from '../random/seeded-rng.js';

const TICK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const STARTING_CAPITAL = 100_000;
const REPUTATION_NEUTRAL = 50;

/**
 * Calculate player level based on net worth.
 * level = floor(log2(netWorth / startingCapital)) + 1, clamped to 1-50.
 */
export function calculateLevel(netWorth: number, startingCapital?: number): number {
  const base = startingCapital ?? STARTING_CAPITAL;
  if (netWorth <= 0 || base <= 0) return 1;

  const ratio = netWorth / base;
  if (ratio <= 1) return 1;

  const level = Math.floor(Math.log2(ratio)) + 1;
  return clamp(level, 1, 50);
}

/**
 * Calculate reputation decay toward neutral (50).
 * Moves 1 point toward 50 per tick if no recent activity.
 */
function calculateReputationDecay(currentReputation: number): number {
  if (currentReputation === REPUTATION_NEUTRAL) return 0;
  return currentReputation > REPUTATION_NEUTRAL ? -1 : 1;
}

/**
 * Process passive income and expenses for all active businesses.
 */
function processBusinesses(
  businesses: TickInput['player']['businesses'],
  rng: SeededRNG,
): { updates: BusinessUpdate[]; totalRevenue: number; totalExpenses: number; ledgerEntries: TickLedgerEntry[] } {
  const updates: BusinessUpdate[] = [];
  const ledgerEntries: TickLedgerEntry[] = [];
  let totalRevenue = 0;
  let totalExpenses = 0;

  for (const business of businesses) {
    if (business.status === 'bankrupt') continue;

    // Revenue per tick: based on valuation, with variance
    const businessRng = rng.fork(`biz:${business.id}`);
    let statusMultiplier = 1.0;
    if (business.status === 'thriving') statusMultiplier = 1.3;
    if (business.status === 'struggling') statusMultiplier = 0.6;

    const tickRevenue = Math.round(
      business.revenue * statusMultiplier * (0.8 + businessRng.random() * 0.4),
    );
    const tickExpenses = Math.round(
      business.expenses * (0.9 + businessRng.random() * 0.2),
    );

    const netIncome = tickRevenue - tickExpenses;
    totalRevenue += tickRevenue;
    totalExpenses += tickExpenses;

    // Valuation fluctuation: small random change each tick
    const valuationChange = Math.round(
      business.valuation * (businessRng.random() - 0.48) * 0.02,
    );

    updates.push({
      businessId: business.id,
      revenueDelta: netIncome,
      valuationDelta: valuationChange,
    });

    if (tickRevenue > 0) {
      ledgerEntries.push({
        type: 'business_revenue',
        amount: tickRevenue,
        description: `Revenue from business ${business.id}`,
        referenceId: business.id,
      });
    }

    if (tickExpenses > 0) {
      ledgerEntries.push({
        type: 'business_expense',
        amount: -tickExpenses,
        description: `Expenses for business ${business.id}`,
        referenceId: business.id,
      });
    }
  }

  return { updates, totalRevenue, totalExpenses, ledgerEntries };
}

/**
 * Process a single game tick.
 *
 * This is the CORE simulation loop -- a pure function that takes the current
 * game state and returns all mutations. The caller is responsible for
 * persisting changes.
 *
 * Steps:
 * 1. Calculate energy replenishment
 * 2. Process business passive income/expenses
 * 3. Generate new opportunities (use opportunity generator)
 * 4. Calculate level progression (based on net worth thresholds)
 * 5. Apply reputation decay toward 50 (neutral) if no activity
 * 6. Aggregate all changes
 */
export function processTick(input: TickInput): TickOutput {
  const { player, rules, rng, now } = input;
  const tickRng = rng.fork(`tick:${player.tickCount}`);

  // 1. Energy replenishment
  const energyReplenished = calculateReplenishment(
    TICK_INTERVAL_MS,
    player.maxEnergy,
    player.energy,
  );

  // 2. Process businesses
  const bizResult = processBusinesses(player.businesses, tickRng);
  const businessNetIncome = bizResult.totalRevenue - bizResult.totalExpenses;

  // 3. Generate new opportunities
  const playerContext: PlayerContext = {
    characterId: player.characterId,
    seasonId: player.seasonId,
    level: player.level,
    energy: player.energy + energyReplenished,
    cash: player.cash + businessNetIncome,
    netWorth: player.netWorth,
    reputation: player.reputation,
    attributes: player.attributes,
    activeOpportunityCount: player.activeOpportunityCount,
    activeBusinessCount: player.activeBusinessCount,
    cooldowns: player.cooldowns,
  };
  const newOpportunities = generateOpportunities(playerContext, rules, tickRng, now);

  // 4. Level progression
  const projectedNetWorth = player.netWorth + businessNetIncome;
  const newLevel = calculateLevel(projectedNetWorth);

  // 5. Reputation decay
  const reputationDecay = calculateReputationDecay(player.reputation);

  // 6. Aggregate ledger entries
  const ledgerEntries: TickLedgerEntry[] = [...bizResult.ledgerEntries];

  // 7. Generate events for significant changes
  const events: TickEvent[] = [];

  // Level up event
  if (newLevel > player.level) {
    events.push({
      eventType: 'level_up',
      importance: 70,
      description: `Advanced from level ${player.level} to level ${newLevel}!`,
      isPublic: true,
      payload: { previousLevel: player.level, newLevel },
    });
  }

  // Significant business income event
  if (businessNetIncome > player.netWorth * 0.05) {
    events.push({
      eventType: 'business_milestone',
      importance: 40,
      description: `Businesses generated $${businessNetIncome.toLocaleString()} net income this tick.`,
      isPublic: false,
      payload: { netIncome: businessNetIncome },
    });
  }

  // New opportunity events
  for (const opp of newOpportunities) {
    if (opp.importance >= 60) {
      events.push({
        eventType: 'opportunity_available',
        importance: opp.importance,
        description: `New ${opp.type.replace(/_/g, ' ')} opportunity available.`,
        isPublic: false,
        payload: { opportunityId: opp.id, type: opp.type },
      });
    }
  }

  return {
    cashDelta: businessNetIncome,
    reputationDelta: reputationDecay,
    influenceDelta: 0,
    energyReplenished,
    newLevel,
    ledgerEntries,
    newOpportunities,
    events,
    businessUpdates: bizResult.updates,
  };
}
