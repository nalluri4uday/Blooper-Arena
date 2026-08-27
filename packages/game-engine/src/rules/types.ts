export interface EventRule {
  type: string;
  displayName: string;
  category: string;
  eligibility: {
    minLevel?: number;
    minEnergy?: number;
    maxActiveBusinesses?: number;
    minReputation?: number;
    minCash?: number;
  };
  generation: {
    baseProbability: number;
    modifiers: Record<string, number>; // attribute name -> modifier value
    cooldownHours?: number;
    maxPerDay?: number;
  };
  choices: Array<{
    key: string;
    label: string;
    energyCost: number;
    description?: string;
  }>;
  outcomes: Record<string, OutcomeRule>;
  ai?: {
    narrateIfImportanceGte?: number;
    templateFallback?: string;
  };
  importance: {
    base: number;
    modifiers?: Record<string, number>;
  };
}

export interface OutcomeRule {
  resolver: string;
  baseEffects?: Record<string, number>;
  variableEffects?: Record<string, unknown>;
}

export interface SeasonConfig {
  startingCapital: number;
  targetNetWorth: number;
  durationDays: number;
  tickIntervalMinutes: number;
  energyReplenishmentPerHour: number;
  maxEnergy: number;
  levelThresholds?: Array<{ level: number; minNetWorth: number }>;
}
