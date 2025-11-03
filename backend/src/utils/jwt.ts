import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generates an access token
 * @param payload - JWT payload
 * @returns Access token
 */
export function generateAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as string | number,
  };
  return jwt.sign(payload, config.jwt.secret, options);
}

/**
 * Generates a refresh token
 * @param payload - JWT payload
 * @returns Refresh token
 */
export function generateRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as string | number,
  };
  return jwt.sign(payload, config.jwt.refreshSecret, options);
}

/**
 * Verifies an access token
 * @param token - Access token to verify
 * @returns Decoded JWT payload
 * @throws {JsonWebTokenError} If token is invalid
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}

/**
 * Verifies a refresh token
 * @param token - Refresh token to verify
 * @returns Decoded JWT payload
 * @throws {JsonWebTokenError} If token is invalid
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
}

/**
 * Generates both access and refresh tokens
 * @param payload - JWT payload
 * @returns Object containing both tokens
 */
export function generateTokenPair(payload: JwtPayload): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}
