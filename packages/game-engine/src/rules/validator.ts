import { z } from 'zod';

/**
 * Zod schema for validating outcome rules.
 */
export const OutcomeRuleSchema = z.object({
  resolver: z.string(),
  baseEffects: z.record(z.string(), z.number()).optional(),
  variableEffects: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Zod schema for validating choice definitions.
 */
export const ChoiceSchema = z.object({
  key: z.string(),
  label: z.string(),
  energyCost: z.number().min(0),
  description: z.string().optional(),
});

/**
 * Zod schema for validating eligibility requirements.
 */
export const EligibilitySchema = z.object({
  minLevel: z.number().min(1).optional(),
  minEnergy: z.number().min(0).optional(),
  maxActiveBusinesses: z.number().min(0).optional(),
  minReputation: z.number().min(0).optional(),
  minCash: z.number().min(0).optional(),
});

/**
 * Zod schema for validating generation configuration.
 */
export const GenerationSchema = z.object({
  baseProbability: z.number().min(0).max(1),
  modifiers: z.record(z.string(), z.number()),
  cooldownHours: z.number().min(0).optional(),
  maxPerDay: z.number().min(1).optional(),
});

/**
 * Zod schema for validating AI configuration.
 */
export const AiConfigSchema = z.object({
  narrateIfImportanceGte: z.number().optional(),
  templateFallback: z.string().optional(),
});

/**
 * Zod schema for validating importance configuration.
 */
export const ImportanceSchema = z.object({
  base: z.number().min(0).max(100),
  modifiers: z.record(z.string(), z.number()).optional(),
});

/**
 * Zod schema for validating a complete event rule.
 */
export const EventRuleSchema = z.object({
  type: z.string(),
  displayName: z.string(),
  category: z.string(),
  eligibility: EligibilitySchema,
  generation: GenerationSchema,
  choices: z.array(ChoiceSchema).min(1),
  outcomes: z.record(z.string(), OutcomeRuleSchema),
  ai: AiConfigSchema.optional(),
  importance: ImportanceSchema,
});

/**
 * Zod schema for validating an array of event rules.
 */
export const EventRulesArraySchema = z.array(EventRuleSchema);

/**
 * Zod schema for validating level thresholds.
 */
export const LevelThresholdSchema = z.object({
  level: z.number().min(1),
  minNetWorth: z.number().min(0),
});

/**
 * Zod schema for validating season configuration.
 */
export const SeasonConfigSchema = z.object({
  startingCapital: z.number().positive(),
  targetNetWorth: z.number().positive(),
  durationDays: z.number().positive(),
  tickIntervalMinutes: z.number().positive(),
  energyReplenishmentPerHour: z.number().positive(),
  maxEnergy: z.number().positive(),
  levelThresholds: z.array(LevelThresholdSchema).optional(),
});

/**
 * Validate an array of event rules. Returns the validated data or throws.
 */
export function validateEventRules(data: unknown): z.infer<typeof EventRulesArraySchema> {
  return EventRulesArraySchema.parse(data);
}

/**
 * Validate season configuration. Returns the validated data or throws.
 */
export function validateSeasonConfig(data: unknown): z.infer<typeof SeasonConfigSchema> {
  return SeasonConfigSchema.parse(data);
}

/**
 * Safe validation that returns a result object instead of throwing.
 */
export function safeValidateEventRules(data: unknown) {
  return EventRulesArraySchema.safeParse(data);
}

/**
 * Safe validation that returns a result object instead of throwing.
 */
export function safeValidateSeasonConfig(data: unknown) {
  return SeasonConfigSchema.safeParse(data);
}
