import { z } from 'zod';

export const joinSeasonSchema = z.object({
  characterId: z.string().min(1, 'Character ID must not be empty'),
});

export type JoinSeasonInput = z.infer<typeof joinSeasonSchema>;
