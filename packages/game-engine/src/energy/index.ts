export type { EnergyState, EnergyConfig } from './types.js';
export {
  calculateCurrentEnergy,
  canAffordAction,
  deductEnergy,
  calculateReplenishment,
} from './energy-manager.js';
