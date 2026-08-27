/**
 * Standard sigmoid function: maps any real number to (0, 1).
 */
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Normalize a value into the [0, 1] range given a min and max.
 * Values outside [min, max] are clamped.
 */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  const clamped = Math.max(min, Math.min(max, value));
  return (clamped - min) / (max - min);
}

/**
 * Clamp a value to the range [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between a and b by factor t.
 * When t=0 returns a, when t=1 returns b.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
