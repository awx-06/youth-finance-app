import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation';
import { updateProfileSchema, linkChildSchema } from '../validators/user.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/profile', userController.getProfile);

router.put(
  '/profile',
  validate(updateProfileSchema),
  userController.updateProfile
);

router.post(
  '/link-child',
  authorize('PARENT'),
  validate(linkChildSchema),
  userController.linkChild
);

router.get(
  '/children',
  authorize('PARENT'),
  userController.getChildren
);

export default router;
