import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';
import * as savingsGoalService from '../services/savingsGoal.service';
import { CreateSavingsGoalInput, UpdateSavingsGoalInput } from '../validators/savingsGoal.validator';

/**
 * Create a new savings goal
 * POST /api/v1/savings-goals
 */
export const createGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const data: CreateSavingsGoalInput = req.body;
  const goal = await savingsGoalService.createSavingsGoal(userId, data);

  res.status(201).json({
    success: true,
    message: 'Savings goal created successfully',
    data: goal,
  });
});

/**
 * Get all savings goals
 * GET /api/v1/savings-goals
 */
export const getGoals = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const goals = await savingsGoalService.getSavingsGoals(userId);

  res.json({
    success: true,
    data: goals,
  });
});

/**
 * Update a savings goal
 * PUT /api/v1/savings-goals/:id
 */
export const updateGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const data: UpdateSavingsGoalInput = req.body;
  const goal = await savingsGoalService.updateSavingsGoal(userId, id, data);

  res.json({
    success: true,
    message: 'Savings goal updated successfully',
    data: goal,
  });
});

/**
 * Delete a savings goal
 * DELETE /api/v1/savings-goals/:id
 */
export const deleteGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  await savingsGoalService.deleteSavingsGoal(userId, id);

  res.json({
    success: true,
    message: 'Savings goal deleted successfully',
  });
});
