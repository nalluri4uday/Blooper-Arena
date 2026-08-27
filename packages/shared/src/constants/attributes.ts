export const ATTRIBUTE_TOTAL = 100;
export const ATTRIBUTE_MIN = 0;
export const ATTRIBUTE_MAX = 100;
export const ATTRIBUTE_NAMES = [
  'strategy',
  'negotiation',
  'riskAppetite',
  'charisma',
  'discipline',
  'creativity',
] as const;
export type AttributeName = (typeof ATTRIBUTE_NAMES)[number];
