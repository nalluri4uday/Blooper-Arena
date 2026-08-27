export const ENERGY_COSTS = {
  meetCharacter: 2,
  applyForOpportunity: 3,
  negotiate: 6,
  launchBusiness: 15,
  challengeRival: 12,
  majorTakeover: 20,
  acceptJob: 3,
  investSmall: 3,
  investLarge: 8,
  socialEvent: 2,
  skillChallenge: 5,
} as const;

export const ENERGY_CONFIG = {
  maxEnergy: 100,
  replenishmentPerHour: 10,
  replenishmentIntervalMinutes: 6, // 1 energy every 6 minutes
} as const;
