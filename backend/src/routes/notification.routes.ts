import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', notificationController.getNotifications);

router.put('/:id/read', notificationController.markAsRead);

router.put('/read-all', notificationController.markAllAsRead);

export default router;
