import { z } from 'zod';

export const createTransactionSchema = z.object({
  fromAccountId: z.string().uuid().optional(),
  toAccountId: z.string().uuid().optional(),
  type: z.enum(['ALLOWANCE', 'PURCHASE', 'TRANSFER', 'SAVINGS', 'WITHDRAWAL', 'REFUND']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateTransactionStatusSchema = z.object({
  declinedReason: z.string().optional(),
});

export const transactionFiltersSchema = z.object({
  accountId: z.string().uuid().optional(),
  type: z.enum(['ALLOWANCE', 'PURCHASE', 'TRANSFER', 'SAVINGS', 'WITHDRAWAL', 'REFUND']).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'COMPLETED', 'DECLINED', 'FAILED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.string().transform(Number).pipe(z.number().positive().max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().nonnegative()).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionStatusInput = z.infer<typeof updateTransactionStatusSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
