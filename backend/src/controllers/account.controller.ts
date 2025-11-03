import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';
import * as accountService from '../services/account.service';

/**
 * Get all accounts
 * GET /api/v1/accounts
 */
export const getAccounts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const accounts = await accountService.getAccounts(userId);

  res.json({
    success: true,
    data: accounts,
  });
});

/**
 * Get account by ID
 * GET /api/v1/accounts/:id
 */
export const getAccountById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const account = await accountService.getAccountById(userId, id);

  res.json({
    success: true,
    data: account,
  });
});

/**
 * Get account balance
 * GET /api/v1/accounts/:id/balance
 */
export const getBalance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const balance = await accountService.getAccountBalance(userId, id);

  res.json({
    success: true,
    data: balance,
  });
});

/**
 * Create new account
 * POST /api/v1/accounts
 */
export const createAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { childId, name } = req.body;
  const account = await accountService.createAccount(userId, childId, name);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: account,
  });
});
