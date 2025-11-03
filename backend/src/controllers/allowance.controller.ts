import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';
import * as allowanceService from '../services/allowance.service';
import { CreateAllowanceInput, UpdateAllowanceInput } from '../validators/allowance.validator';

/**
 * Create a new allowance
 * POST /api/v1/allowances
 */
export const createAllowance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const data: CreateAllowanceInput = req.body;
  const allowance = await allowanceService.createAllowance(userId, data);

  res.status(201).json({
    success: true,
    message: 'Allowance created successfully',
    data: allowance,
  });
});

/**
 * Get all allowances
 * GET /api/v1/allowances
 */
export const getAllowances = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const allowances = await allowanceService.getAllowances(userId);

  res.json({
    success: true,
    data: allowances,
  });
});

/**
 * Update an allowance
 * PUT /api/v1/allowances/:id
 */
export const updateAllowance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const data: UpdateAllowanceInput = req.body;
  const allowance = await allowanceService.updateAllowance(userId, id, data);

  res.json({
    success: true,
    message: 'Allowance updated successfully',
    data: allowance,
  });
});

/**
 * Delete an allowance
 * DELETE /api/v1/allowances/:id
 */
export const deleteAllowance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  await allowanceService.deleteAllowance(userId, id);

  res.json({
    success: true,
    message: 'Allowance deleted successfully',
  });
});

/**
 * Process due allowances (admin/cron endpoint)
 * POST /api/v1/allowances/process
 */
export const processAllowances = asyncHandler(async (req: AuthRequest, res: Response) => {
  await allowanceService.processDueAllowances();

  res.json({
    success: true,
    message: 'Allowances processed successfully',
  });
});
