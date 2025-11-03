import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';
import * as authService from '../services/auth.service';
import { RegisterInput, LoginInput, RefreshTokenInput } from '../validators/auth.validator';

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data: RegisterInput = req.body;
  const result = await authService.registerUser(data);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data: LoginInput = req.body;
  const result = await authService.loginUser(data);

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body as RefreshTokenInput;
  const cookieToken = req.cookies?.refreshToken;
  
  const token = refreshToken || cookieToken;
  
  const result = await authService.refreshAccessToken(token);

  // Update refresh token cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken: result.accessToken,
    },
  });
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  const cookieToken = req.cookies?.refreshToken;
  
  const token = refreshToken || cookieToken;
  
  if (token) {
    await authService.logoutUser(token);
  }

  // Clear cookie
  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logout successful',
  });
});
