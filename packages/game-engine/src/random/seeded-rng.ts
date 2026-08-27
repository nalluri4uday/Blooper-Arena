import seedrandom from 'seedrandom';

export interface SeededRNG {
  /** Create a sub-RNG for a specific context */
  fork(context: string): SeededRNG;
  /** Generate a float in [0, 1) */
  random(): number;
  /** Generate an integer in [min, max] inclusive */
  randomInt(min: number, max: number): number;
  /** Pick from weighted options */
  weightedChoice<T>(options: Array<{ item: T; weight: number }>): T;
  /** Pick a random element from an array */
  pick<T>(items: T[]): T;
  /** Shuffle an array (Fisher-Yates) */
  shuffle<T>(items: T[]): T[];
  /** Return true with given probability (0-1) */
  chance(probability: number): boolean;
}

export function createSeededRNG(seed: string): SeededRNG {
  const prng = seedrandom(seed);

  const rng: SeededRNG = {
    fork(context: string): SeededRNG {
      return createSeededRNG(`${seed}:${context}`);
    },

    random(): number {
      return prng();
    },

    randomInt(min: number, max: number): number {
      const range = max - min + 1;
      return Math.floor(prng() * range) + min;
    },

    weightedChoice<T>(options: Array<{ item: T; weight: number }>): T {
      if (options.length === 0) {
        throw new Error('weightedChoice called with empty options');
      }

      const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
      if (totalWeight <= 0) {
        throw new Error('Total weight must be positive');
      }

      let roll = prng() * totalWeight;

      for (const option of options) {
        roll -= option.weight;
        if (roll <= 0) {
          return option.item;
        }
      }

      // Fallback to last item (handles floating-point edge cases)
      return options[options.length - 1]!.item;
    },

    pick<T>(items: T[]): T {
      if (items.length === 0) {
        throw new Error('pick called with empty array');
      }
      const index = Math.floor(prng() * items.length);
      return items[index]!;
    },

    shuffle<T>(items: T[]): T[] {
      const result = [...items];
      // Fisher-Yates shuffle
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(prng() * (i + 1));
        const temp = result[i]!;
        result[i] = result[j]!;
        result[j] = temp;
      }
      return result;
    },

    chance(probability: number): boolean {
      return prng() < probability;
    },
  };

  return rng;
}

/**
 * Create a deterministic RNG for a specific player at a specific tick.
 * The seed chain: seasonSeed -> hash(seasonSeed + playerId + tickNumber + eventType)
 */
export function createPlayerTickRNG(
  seasonSeed: string,
  playerId: string,
  tickNumber: number,
): SeededRNG {
  const compositeSeed = `${seasonSeed}:${playerId}:${tickNumber}`;
  return createSeededRNG(compositeSeed);
}
