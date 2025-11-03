import { PrismaClient, SavingsGoal } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler';
import { CreateSavingsGoalInput, UpdateSavingsGoalInput } from '../validators/savingsGoal.validator';
import { createNotification } from './notification.service';

const prisma = new PrismaClient();

/**
 * Creates a new savings goal
 */
export async function createSavingsGoal(
  userId: string,
  data: CreateSavingsGoalInput
): Promise<SavingsGoal> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      parentProfile: true,
      childProfile: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify account access
  const account = await prisma.account.findUnique({
    where: { id: data.accountId },
    include: {
      child: true,
    },
  });

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  // Check permissions
  const hasPermission =
    (user.role === 'CHILD' && user.childProfile?.id === account.childId) ||
    (user.role === 'PARENT' && user.parentProfile?.children.some(c => c.id === account.childId));

  if (!hasPermission) {
    throw new ForbiddenError('Access denied to this account');
  }

  // Create savings goal
  const savingsGoal = await prisma.savingsGoal.create({
    data: {
      childId: account.childId,
      accountId: data.accountId,
      name: data.name,
      targetAmount: data.targetAmount,
      deadline: data.deadline ? new Date(data.deadline) : null,
      imageUrl: data.imageUrl,
      description: data.description,
    },
  });

  return savingsGoal;
}

/**
 * Gets all savings goals for a user
 */
export async function getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      parentProfile: {
        include: {
          children: true,
        },
      },
      childProfile: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  let childIds: string[] = [];

  if (user.role === 'PARENT' && user.parentProfile) {
    childIds = user.parentProfile.children.map((child) => child.id);
  } else if (user.role === 'CHILD' && user.childProfile) {
    childIds = [user.childProfile.id];
  }

  const savingsGoals = await prisma.savingsGoal.findMany({
    where: {
      childId: { in: childIds },
    },
    include: {
      account: {
        select: {
          id: true,
          name: true,
          balance: true,
        },
      },
      child: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return savingsGoals;
}

/**
 * Updates a savings goal
 */
export async function updateSavingsGoal(
  userId: string,
  goalId: string,
  data: UpdateSavingsGoalInput
): Promise<SavingsGoal> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      parentProfile: true,
      childProfile: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const savingsGoal = await prisma.savingsGoal.findUnique({
    where: { id: goalId },
    include: {
      child: true,
    },
  });

  if (!savingsGoal) {
    throw new NotFoundError('Savings goal not found');
  }

  // Check permissions
  const hasPermission =
    (user.role === 'CHILD' && user.childProfile?.id === savingsGoal.childId) ||
    (user.role === 'PARENT' && user.parentProfile?.children.some(c => c.id === savingsGoal.childId));

  if (!hasPermission) {
    throw new ForbiddenError('Not authorized to update this savings goal');
  }

  // Check if goal should be marked as completed
  let isCompleted = savingsGoal.isCompleted;
  let completedAt = savingsGoal.completedAt;

  if (data.currentAmount !== undefined) {
    if (data.currentAmount >= Number(savingsGoal.targetAmount) && !isCompleted) {
      isCompleted = true;
      completedAt = new Date();

      // Create notification
      await createNotification({
        userId: savingsGoal.child.userId,
        type: 'SAVINGS_GOAL_REACHED',
        title: 'Savings Goal Reached!',
        message: `Congratulations! You've reached your savings goal: ${savingsGoal.name}`,
        metadata: { goalId: savingsGoal.id },
      });
    }
  }

  // Update savings goal
  const updatedGoal = await prisma.savingsGoal.update({
    where: { id: goalId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.targetAmount !== undefined && { targetAmount: data.targetAmount }),
      ...(data.currentAmount !== undefined && { currentAmount: data.currentAmount }),
      ...(data.deadline !== undefined && { deadline: data.deadline ? new Date(data.deadline) : null }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.description !== undefined && { description: data.description }),
      isCompleted,
      completedAt,
    },
  });

  return updatedGoal;
}

/**
 * Deletes a savings goal
 */
export async function deleteSavingsGoal(userId: string, goalId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      parentProfile: true,
      childProfile: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const savingsGoal = await prisma.savingsGoal.findUnique({
    where: { id: goalId },
  });

  if (!savingsGoal) {
    throw new NotFoundError('Savings goal not found');
  }

  // Check permissions
  const hasPermission =
    (user.role === 'CHILD' && user.childProfile?.id === savingsGoal.childId) ||
    (user.role === 'PARENT' && user.parentProfile?.children.some(c => c.id === savingsGoal.childId));

  if (!hasPermission) {
    throw new ForbiddenError('Not authorized to delete this savings goal');
  }

  await prisma.savingsGoal.delete({
    where: { id: goalId },
  });
}
