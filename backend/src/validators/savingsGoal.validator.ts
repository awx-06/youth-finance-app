import { z } from 'zod';

export const createSavingsGoalSchema = z.object({
  accountId: z.string().uuid('Invalid account ID'),
  name: z.string().min(1, 'Name is required'),
  targetAmount: z.number().positive('Target amount must be positive'),
  deadline: z.string().datetime().optional(),
  imageUrl: z.string().url().optional(),
  description: z.string().optional(),
});

export const updateSavingsGoalSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  currentAmount: z.number().nonnegative().optional(),
  deadline: z.string().datetime().optional(),
  imageUrl: z.string().url().optional(),
  description: z.string().optional(),
});

export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>;
export type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalSchema>;
