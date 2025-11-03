import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';
import * as notificationService from '../services/notification.service';

/**
 * Get all notifications
 * GET /api/v1/notifications
 */
export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  
  const notifications = await notificationService.getNotifications(userId, limit, offset);
  const unreadCount = await notificationService.getUnreadCount(userId);

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount,
    },
  });
});

/**
 * Mark notification as read
 * PUT /api/v1/notifications/:id/read
 */
export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const notification = await notificationService.markNotificationAsRead(userId, id);

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: notification,
  });
});

/**
 * Mark all notifications as read
 * PUT /api/v1/notifications/read-all
 */
export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const result = await notificationService.markAllNotificationsAsRead(userId);

  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: result,
  });
});
