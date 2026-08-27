export interface EnergyState {
  current: number;
  max: number;
  lastReplenishedAt: Date;
}

export interface EnergyConfig {
  maxEnergy: number;
  replenishmentPerHour: number;
  replenishmentIntervalMinutes: number;
}
