import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation';
import { createTransactionSchema, transactionFiltersSchema, updateTransactionStatusSchema } from '../validators/transaction.validator';
import { transactionRateLimiter } from '../middleware/rateLimit';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post(
  '/',
  transactionRateLimiter,
  validate(createTransactionSchema),
  transactionController.createTransaction
);

router.get(
  '/',
  validate(transactionFiltersSchema, 'query'),
  transactionController.getTransactions
);

router.put(
  '/:id/approve',
  authorize('PARENT'),
  transactionController.approveTransaction
);

router.put(
  '/:id/decline',
  authorize('PARENT'),
  validate(updateTransactionStatusSchema),
  transactionController.declineTransaction
);

export default router;
