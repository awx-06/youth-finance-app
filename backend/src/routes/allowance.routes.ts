import { Router } from 'express';
import * as allowanceController from '../controllers/allowance.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation';
import { createAllowanceSchema, updateAllowanceSchema } from '../validators/allowance.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post(
  '/',
  authorize('PARENT'),
  validate(createAllowanceSchema),
  allowanceController.createAllowance
);

router.get('/', allowanceController.getAllowances);

router.put(
  '/:id',
  authorize('PARENT'),
  validate(updateAllowanceSchema),
  allowanceController.updateAllowance
);

router.delete(
  '/:id',
  authorize('PARENT'),
  allowanceController.deleteAllowance
);

router.post(
  '/process',
  authorize('PARENT'),
  allowanceController.processAllowances
);

export default router;
