import { z } from 'zod';

export const submitDecisionSchema = z.object({
  selectedOption: z.string().min(1, 'Selected option must not be empty'),
  idempotencyKey: z
    .string()
    .uuid('Idempotency key must be a valid UUID')
    .optional(),
});

export type SubmitDecisionInput = z.infer<typeof submitDecisionSchema>;
