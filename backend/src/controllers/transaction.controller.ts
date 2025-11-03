import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';
import * as transactionService from '../services/transaction.service';
import { CreateTransactionInput, TransactionFilters, UpdateTransactionStatusInput } from '../validators/transaction.validator';

/**
 * Create a new transaction
 * POST /api/v1/transactions
 */
export const createTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const data: CreateTransactionInput = req.body;
  const transaction = await transactionService.createTransaction(userId, data);

  res.status(201).json({
    success: true,
    message: 'Transaction created successfully',
    data: transaction,
  });
});

/**
 * Get transactions with filters
 * GET /api/v1/transactions
 */
export const getTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const filters = req.query as unknown as TransactionFilters;
  const transactions = await transactionService.getTransactions(userId, filters);

  res.json({
    success: true,
    data: transactions,
  });
});

/**
 * Approve a transaction
 * PUT /api/v1/transactions/:id/approve
 */
export const approveTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const transaction = await transactionService.approveTransaction(userId, id);

  res.json({
    success: true,
    message: 'Transaction approved successfully',
    data: transaction,
  });
});

/**
 * Decline a transaction
 * PUT /api/v1/transactions/:id/decline
 */
export const declineTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { declinedReason } = req.body as UpdateTransactionStatusInput;
  const transaction = await transactionService.declineTransaction(userId, id, declinedReason);

  res.json({
    success: true,
    message: 'Transaction declined successfully',
    data: transaction,
  });
});
