import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';
import { authRateLimiter } from '../middleware/rateLimit';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refresh
);

router.post(
  '/logout',
  authController.logout
);

export default router;
