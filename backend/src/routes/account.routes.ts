import { Router } from 'express';
import * as accountController from '../controllers/account.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', accountController.getAccounts);

router.get('/:id', accountController.getAccountById);

router.get('/:id/balance', accountController.getBalance);

router.post('/', accountController.createAccount);

export default router;
