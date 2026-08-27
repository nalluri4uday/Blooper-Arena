import { EventRule } from '../rules/types.js';
import { SeededRNG } from '../random/seeded-rng.js';
import { GeneratedOpportunity } from '../opportunities/types.js';

export interface BusinessState {
  id: string;
  valuation: number;
  revenue: number;
  expenses: number;
  status: string; // 'active', 'struggling', 'thriving', 'bankrupt'
}

export interface TickInput {
  player: {
    id: string;
    characterId: string;
    seasonId: string;
    cash: number;
    debt: number;
    netWorth: number;
    energy: number;
    maxEnergy: number;
    reputation: number;
    influence: number;
    level: number;
    tickCount: number;
    attributes: {
      strategy: number;
      negotiation: number;
      riskAppetite: number;
      charisma: number;
      discipline: number;
      creativity: number;
    };
    activeOpportunityCount: number;
    activeBusinessCount: number;
    businesses: BusinessState[];
    cooldowns: Map<string, Date>;
  };
  rules: EventRule[];
  rng: SeededRNG;
  now: Date;
}

export interface TickLedgerEntry {
  type: string;
  amount: number;
  description: string;
  referenceId?: string;
}

export interface TickEvent {
  eventType: string;
  importance: number;
  description: string;
  isPublic: boolean;
  payload: Record<string, unknown>;
}

export interface BusinessUpdate {
  businessId: string;
  revenueDelta: number;
  valuationDelta: number;
}

export interface TickOutput {
  cashDelta: number;
  reputationDelta: number;
  influenceDelta: number;
  energyReplenished: number;
  newLevel: number;
  ledgerEntries: TickLedgerEntry[];
  newOpportunities: GeneratedOpportunity[];
  events: TickEvent[];
  businessUpdates: BusinessUpdate[];
}

export interface OutcomeInput {
  opportunity: {
    type: string;
    payload: Record<string, unknown>;
    importance: number;
  };
  choice: string; // 'ACCEPT', 'REJECT', 'NEGOTIATE', etc.
  player: {
    attributes: {
      strategy: number;
      negotiation: number;
      riskAppetite: number;
      charisma: number;
      discipline: number;
      creativity: number;
    };
    cash: number;
    netWorth: number;
    reputation: number;
    level: number;
  };
  rule: EventRule;
  rng: SeededRNG;
  relationships?: Map<string, number>; // characterId -> strength
}

export interface OutcomeResult {
  cashDelta: number;
  reputationDelta: number;
  influenceDelta: number;
  energyCost: number;
  experienceGained: number;
  description: string;
  ledgerType: string;
  newBusiness?: { name: string; type: string; valuation: number };
  relationshipChanges?: Array<{
    targetId: string;
    strengthDelta: number;
    trustDelta: number;
  }>;
  isSuccess: boolean;
}
