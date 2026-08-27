// Seeded RNG
export { createSeededRNG, createPlayerTickRNG, type SeededRNG } from './random/seeded-rng.js';

// Formulas
export {
  sigmoid,
  normalize,
  clamp,
  lerp,
  calculateNegotiationScore,
  calculateInvestmentOutcome,
  calculateSalary,
  calculateRiskOutcome,
  type NegotiationParams,
  type NegotiationResult,
  type InvestmentParams,
  type InvestmentResult,
  type SalaryParams,
  type SalaryResult,
  type RiskParams,
  type RiskResult,
} from './formulas/index.js';

// Rules
export {
  type EventRule,
  type OutcomeRule,
  type SeasonConfig,
  loadEventRules,
  loadSeasonConfig,
  parseEventRules,
  parseSeasonConfig,
  EventRuleSchema,
  SeasonConfigSchema,
  validateEventRules,
  validateSeasonConfig,
  safeValidateEventRules,
  safeValidateSeasonConfig,
} from './rules/index.js';

// Energy
export {
  type EnergyState,
  type EnergyConfig,
  calculateCurrentEnergy,
  canAffordAction,
  deductEnergy,
  calculateReplenishment,
} from './energy/index.js';

// Economy
export {
  type LedgerOperation,
  type LedgerEntry,
  type NetWorthComponents,
  createLedgerEntry,
  createMultipleEntries,
  resetLedgerCounter,
  calculateNetWorth,
  hasReachedTarget,
  calculateProgress,
} from './economy/index.js';

// Scoring
export {
  type PlayerScore,
  type RankedPlayer,
  calculateScore,
  rankPlayers,
  extractRankMap,
} from './scoring/index.js';

// Opportunities
export {
  type PlayerContext,
  type GeneratedOpportunity,
  generateOpportunities,
  COMPANY_NAMES,
  INVESTMENT_SECTORS,
  JOB_ROLES,
  BUSINESS_TYPES,
  RISK_EVENTS,
  SKILL_CHALLENGES,
  SOCIAL_EVENTS,
  PARTNER_NAMES,
} from './opportunities/index.js';

// Simulation
export {
  type BusinessState,
  type TickInput,
  type TickOutput,
  type TickLedgerEntry,
  type TickEvent,
  type BusinessUpdate,
  type OutcomeInput,
  type OutcomeResult,
  resolveOutcome,
  processTick,
  calculateLevel,
  getDefaultChoice,
  isExpired,
  timeToExpiry,
} from './simulation/index.js';
