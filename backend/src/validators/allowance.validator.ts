import { z } from 'zod';

export const createAllowanceSchema = z.object({
  childId: z.string().uuid('Invalid child ID'),
  amount: z.number().positive('Amount must be positive'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  description: z.string().optional(),
});

export const updateAllowanceSchema = z.object({
  amount: z.number().positive().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional(),
});

export type CreateAllowanceInput = z.infer<typeof createAllowanceSchema>;
export type UpdateAllowanceInput = z.infer<typeof updateAllowanceSchema>;
