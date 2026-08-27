import { z } from 'zod';
import { ATTRIBUTE_TOTAL, ATTRIBUTE_MIN, ATTRIBUTE_MAX } from '../constants/attributes';

export const attributeSchema = z
  .object({
    strategy: z.number().int().min(ATTRIBUTE_MIN).max(ATTRIBUTE_MAX),
    negotiation: z.number().int().min(ATTRIBUTE_MIN).max(ATTRIBUTE_MAX),
    riskAppetite: z.number().int().min(ATTRIBUTE_MIN).max(ATTRIBUTE_MAX),
    charisma: z.number().int().min(ATTRIBUTE_MIN).max(ATTRIBUTE_MAX),
    discipline: z.number().int().min(ATTRIBUTE_MIN).max(ATTRIBUTE_MAX),
    creativity: z.number().int().min(ATTRIBUTE_MIN).max(ATTRIBUTE_MAX),
  })
  .refine(
    (attrs) => {
      const total =
        attrs.strategy +
        attrs.negotiation +
        attrs.riskAppetite +
        attrs.charisma +
        attrs.discipline +
        attrs.creativity;
      return total === ATTRIBUTE_TOTAL;
    },
    {
      message: `Attribute total must equal ${ATTRIBUTE_TOTAL}`,
    },
  );

export const createCharacterSchema = z.object({
  displayName: z
    .string()
    .min(2)
    .max(24)
    .regex(
      /^[a-zA-Z0-9_\- ]+$/,
      'Display name may only contain alphanumeric characters, underscores, hyphens, and spaces',
    ),
  attributes: attributeSchema,
});

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
