import { PrismaClient, Notification, NotificationType } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Creates a new notification
 */
export async function createNotification(
  data: CreateNotificationInput
): Promise<Notification> {
  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata,
    },
  });

  return notification;
}

/**
 * Gets all notifications for a user
 */
export async function getNotifications(
  userId: string,
  limit = 50,
  offset = 0
): Promise<Notification[]> {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: offset,
  });

  return notifications;
}

/**
 * Gets unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return count;
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<Notification> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  if (notification.userId !== userId) {
    throw new ForbiddenError('Not authorized to update this notification');
  }

  const updatedNotification = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return updatedNotification;
}

/**
 * Marks all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<{ count: number }> {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return { count: result.count };
}

/**
 * Deletes old read notifications (cleanup)
 */
export async function deleteOldNotifications(daysOld = 30): Promise<{ count: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.notification.deleteMany({
    where: {
      isRead: true,
      readAt: {
        lt: cutoffDate,
      },
    },
  });

  return { count: result.count };
}
