export const SEASON_DEFAULTS = {
  startingCapital: 100_000,
  targetNetWorth: 10_000_000,
  durationDays: 30,
  tickIntervalMinutes: 30,
  maxPlayers: 10_000,
  maxDecisionsPerDay: 3,
  maxActiveOpportunities: 5,
} as const;

export const IMPORTANCE_THRESHOLDS = {
  low: 20,
  medium: 50,
  high: 75,
  critical: 90,
} as const;
