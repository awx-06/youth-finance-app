import { Router } from 'express';
import * as savingsGoalController from '../controllers/savingsGoal.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation';
import { createSavingsGoalSchema, updateSavingsGoalSchema } from '../validators/savingsGoal.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post(
  '/',
  validate(createSavingsGoalSchema),
  savingsGoalController.createGoal
);

router.get('/', savingsGoalController.getGoals);

router.put(
  '/:id',
  validate(updateSavingsGoalSchema),
  savingsGoalController.updateGoal
);

router.delete('/:id', savingsGoalController.deleteGoal);

export default router;
