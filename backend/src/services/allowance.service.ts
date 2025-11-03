import { PrismaClient, Allowance, AllowanceFrequency } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler';
import { CreateAllowanceInput, UpdateAllowanceInput } from '../validators/allowance.validator';
import { createTransaction } from './transaction.service';

const prisma = new PrismaClient();

/**
 * Creates a new allowance schedule
 */
export async function createAllowance(
  userId: string,
  data: CreateAllowanceInput
): Promise<Allowance> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { parentProfile: true },
  });

  if (!user || user.role !== 'PARENT' || !user.parentProfile) {
    throw new ForbiddenError('Only parents can create allowances');
  }

  // Verify child belongs to parent
  const child = await prisma.childProfile.findUnique({
    where: { id: data.childId },
  });

  if (!child || child.parentId !== user.parentProfile.id) {
    throw new ForbiddenError('Cannot create allowance for this child');
  }

  // Calculate next due date
  const nextDueDate = calculateNextDueDate(new Date(data.startDate), data.frequency);

  // Create allowance
  const allowance = await prisma.allowance.create({
    data: {
      childId: data.childId,
      amount: data.amount,
      frequency: data.frequency,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      nextDueDate,
      description: data.description,
    },
  });

  return allowance;
}

/**
 * Gets all allowances for a user's children
 */
export async function getAllowances(userId: string): Promise<Allowance[]> {
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

  const allowances = await prisma.allowance.findMany({
    where: {
      childId: { in: childIds },
    },
    include: {
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

  return allowances;
}

/**
 * Updates an allowance
 */
export async function updateAllowance(
  userId: string,
  allowanceId: string,
  data: UpdateAllowanceInput
): Promise<Allowance> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { parentProfile: true },
  });

  if (!user || user.role !== 'PARENT' || !user.parentProfile) {
    throw new ForbiddenError('Only parents can update allowances');
  }

  const allowance = await prisma.allowance.findUnique({
    where: { id: allowanceId },
    include: {
      child: true,
    },
  });

  if (!allowance) {
    throw new NotFoundError('Allowance not found');
  }

  if (allowance.child.parentId !== user.parentProfile.id) {
    throw new ForbiddenError('Not authorized to update this allowance');
  }

  // Update allowance
  const updatedAllowance = await prisma.allowance.update({
    where: { id: allowanceId },
    data: {
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.frequency && {
        frequency: data.frequency,
        nextDueDate: calculateNextDueDate(allowance.nextDueDate, data.frequency),
      }),
      ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });

  return updatedAllowance;
}

/**
 * Deletes an allowance
 */
export async function deleteAllowance(userId: string, allowanceId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { parentProfile: true },
  });

  if (!user || user.role !== 'PARENT' || !user.parentProfile) {
    throw new ForbiddenError('Only parents can delete allowances');
  }

  const allowance = await prisma.allowance.findUnique({
    where: { id: allowanceId },
    include: {
      child: true,
    },
  });

  if (!allowance) {
    throw new NotFoundError('Allowance not found');
  }

  if (allowance.child.parentId !== user.parentProfile.id) {
    throw new ForbiddenError('Not authorized to delete this allowance');
  }

  await prisma.allowance.delete({
    where: { id: allowanceId },
  });
}

/**
 * Processes due allowances (should be called by a cron job)
 */
export async function processDueAllowances(): Promise<void> {
  const now = new Date();

  // Find all active allowances that are due
  const dueAllowances = await prisma.allowance.findMany({
    where: {
      isActive: true,
      nextDueDate: {
        lte: now,
      },
      OR: [
        { endDate: null },
        { endDate: { gte: now } },
      ],
    },
    include: {
      child: {
        include: {
          accounts: {
            where: {
              status: 'ACTIVE',
            },
            take: 1,
          },
        },
      },
    },
  });

  // Process each allowance
  for (const allowance of dueAllowances) {
    try {
      // Get child's primary account
      const account = allowance.child.accounts[0];
      
      if (account) {
        // Create allowance transaction
        await createTransaction('system', {
          toAccountId: account.id,
          type: 'ALLOWANCE',
          amount: Number(allowance.amount),
          description: allowance.description || 'Automated allowance payment',
        });
      }

      // Calculate next due date
      const nextDueDate = calculateNextDueDate(allowance.nextDueDate, allowance.frequency);

      // Update allowance
      await prisma.allowance.update({
        where: { id: allowance.id },
        data: {
          nextDueDate,
        },
      });
    } catch (error) {
      // Log error but continue processing other allowances
      console.error(`Failed to process allowance ${allowance.id}:`, error);
    }
  }
}

/**
 * Calculates the next due date based on frequency
 */
function calculateNextDueDate(currentDate: Date, frequency: AllowanceFrequency): Date {
  const next = new Date(currentDate);

  switch (frequency) {
    case 'DAILY':
      next.setDate(next.getDate() + 1);
      break;
    case 'WEEKLY':
      next.setDate(next.getDate() + 7);
      break;
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1);
      break;
  }

  return next;
}
