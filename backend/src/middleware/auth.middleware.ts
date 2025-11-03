import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from './errorHandler';

/**
 * Extend Express Request to include user information
 */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError') {
        next(new UnauthorizedError('Invalid token'));
      } else if (error.name === 'TokenExpiredError') {
        next(new UnauthorizedError('Token expired'));
      } else {
        next(error);
      }
    } else {
      next(new UnauthorizedError('Authentication failed'));
    }
  }
}

/**
 * Authorization middleware factory
 * Checks if user has one of the required roles
 * @param roles - Array of allowed roles
 */
export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('User not authenticated'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
}

/**
 * Optional authentication middleware
 * Does not throw error if no token is provided
 */
export function optionalAuthenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}
