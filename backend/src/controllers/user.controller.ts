import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';
import * as userService from '../services/user.service';
import { UpdateProfileInput, LinkChildInput } from '../validators/user.validator';

/**
 * Get current user profile
 * GET /api/v1/users/profile
 */
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const user = await userService.getUserProfile(userId);

  res.json({
    success: true,
    data: user,
  });
});

/**
 * Update user profile
 * PUT /api/v1/users/profile
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const data: UpdateProfileInput = req.body;
  const user = await userService.updateUserProfile(userId, data);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
});

/**
 * Link a child to parent
 * POST /api/v1/users/link-child
 */
export const linkChild = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const data: LinkChildInput = req.body;
  await userService.linkChildToParent(userId, data);

  res.json({
    success: true,
    message: 'Child linked successfully',
  });
});

/**
 * Get all children for parent
 * GET /api/v1/users/children
 */
export const getChildren = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const children = await userService.getChildren(userId);

  res.json({
    success: true,
    data: children,
  });
});
