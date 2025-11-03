import { PrismaClient } from '@prisma/client';
import type { Transaction, TransactionStatus } from '@prisma/client';
import { NotFoundError, ForbiddenError, BadRequestError } from '../middleware/errorHandler';
import { CreateTransactionInput, TransactionFilters } from '../validators/transaction.validator';
import { updateAccountBalance } from './account.service';
import { createNotification } from './notification.service';

const prisma = new PrismaClient();

/**
 * Creates a new transaction
 */
export async function createTransaction(
  userId: string,
  data: CreateTransactionInput
): Promise<Transaction> {
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

  // Validate accounts
  if (data.fromAccountId) {
    const fromAccount = await prisma.account.findUnique({
      where: { id: data.fromAccountId },
      include: { child: true },
    });

    if (!fromAccount) {
      throw new NotFoundError('Source account not found');
    }

    // Check if user has permission to use this account
    const hasPermission =
      (user.role === 'CHILD' && user.childProfile?.id === fromAccount.childId) ||
      (user.role === 'PARENT' && user.parentProfile?.children.some((c: { id: string }) => c.id === fromAccount.childId));

    if (!hasPermission) {
      throw new ForbiddenError('Access denied to source account');
    }
  }

  if (data.toAccountId) {
    const toAccount = await prisma.account.findUnique({
      where: { id: data.toAccountId },
    });

    if (!toAccount) {
      throw new NotFoundError('Destination account not found');
    }
  }

  // Determine initial status
  let status: TransactionStatus = 'PENDING';
  
  // Parent transactions are auto-approved
  if (user.role === 'PARENT') {
    status = 'APPROVED';
  }

  // Allowance and refund transactions are auto-approved
  if (data.type === 'ALLOWANCE' || data.type === 'REFUND') {
    status = 'APPROVED';
  }

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      status,
      metadata: data.metadata,
      ...(status === 'APPROVED' && {
        approvedBy: userId,
        approvedAt: new Date(),
      }),
    },
  });

  // If auto-approved, process immediately
  if (status === 'APPROVED') {
    await processTransaction(transaction.id);
  }

  // Create notification
  if (data.toAccountId) {
    const toAccount = await prisma.account.findUnique({
      where: { id: data.toAccountId },
      include: { child: { include: { user: true } } },
    });

    if (toAccount) {
      await createNotification({
        userId: toAccount.child.user.id,
        type: 'TRANSACTION_CREATED',
        title: 'New Transaction',
        message: `You have a new ${data.type.toLowerCase()} transaction of $${data.amount}`,
        metadata: { transactionId: transaction.id },
      });
    }
  }

  return transaction;
}

/**
 * Gets transactions with optional filters
 */
export async function getTransactions(
  userId: string,
  filters?: TransactionFilters
): Promise<Transaction[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      parentProfile: {
        include: {
          children: {
            include: {
              accounts: true,
            },
          },
        },
      },
      childProfile: {
        include: {
          accounts: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Collect account IDs the user has access to
  let accountIds: string[] = [];

  if (user.role === 'PARENT' && user.parentProfile) {
    accountIds = user.parentProfile.children.flatMap((child: { accounts: { id: string }[] }) =>
      child.accounts.map((account: { id: string }) => account.id)
    );
  } else if (user.role === 'CHILD' && user.childProfile) {
    accountIds = user.childProfile.accounts.map((account: { id: string }) => account.id);
  }

  // Build query
  const where: Record<string, unknown> = {
    OR: [
      { fromAccountId: { in: accountIds } },
      { toAccountId: { in: accountIds } },
    ],
  };

  if (filters?.accountId) {
    where.OR = [
      { fromAccountId: filters.accountId },
      { toAccountId: filters.accountId },
    ];
  }

  if (filters?.type) {
    where.type = filters.type;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      (where.createdAt as Record<string, unknown>).gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      (where.createdAt as Record<string, unknown>).lte = new Date(filters.endDate);
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
    include: {
      fromAccount: {
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
      },
      toAccount: {
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
      },
    },
  });

  return transactions;
}

/**
 * Approves a pending transaction
 */
export async function approveTransaction(
  userId: string,
  transactionId: string
): Promise<Transaction> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { parentProfile: true },
  });

  if (!user || user.role !== 'PARENT') {
    throw new ForbiddenError('Only parents can approve transactions');
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      fromAccount: {
        include: {
          child: {
            include: {
              parent: true,
              user: true,
            },
          },
        },
      },
    },
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  if (transaction.status !== 'PENDING') {
    throw new BadRequestError('Transaction is not pending');
  }

  // Verify parent owns the child's account
  if (
    transaction.fromAccount &&
    transaction.fromAccount.child.parentId !== user.parentProfile?.id
  ) {
    throw new ForbiddenError('Not authorized to approve this transaction');
  }

  // Update transaction
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: 'APPROVED',
      approvedBy: userId,
      approvedAt: new Date(),
    },
  });

  // Process the transaction
  await processTransaction(transactionId);

  // Notify child
  if (transaction.fromAccount) {
    await createNotification({
      userId: transaction.fromAccount.child.user.id,
      type: 'TRANSACTION_APPROVED',
      title: 'Transaction Approved',
      message: `Your transaction of $${transaction.amount} has been approved`,
      metadata: { transactionId: transaction.id },
    });
  }

  return updatedTransaction;
}

/**
 * Declines a pending transaction
 */
export async function declineTransaction(
  userId: string,
  transactionId: string,
  reason?: string
): Promise<Transaction> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { parentProfile: true },
  });

  if (!user || user.role !== 'PARENT') {
    throw new ForbiddenError('Only parents can decline transactions');
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      fromAccount: {
        include: {
          child: {
            include: {
              parent: true,
              user: true,
            },
          },
        },
      },
    },
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  if (transaction.status !== 'PENDING') {
    throw new BadRequestError('Transaction is not pending');
  }

  // Verify parent owns the child's account
  if (
    transaction.fromAccount &&
    transaction.fromAccount.child.parentId !== user.parentProfile?.id
  ) {
    throw new ForbiddenError('Not authorized to decline this transaction');
  }

  // Update transaction
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: 'DECLINED',
      declinedReason: reason,
    },
  });

  // Notify child
  if (transaction.fromAccount) {
    await createNotification({
      userId: transaction.fromAccount.child.user.id,
      type: 'TRANSACTION_DECLINED',
      title: 'Transaction Declined',
      message: `Your transaction of $${transaction.amount} has been declined${reason ? `: ${reason}` : ''}`,
      metadata: { transactionId: transaction.id },
    });
  }

  return updatedTransaction;
}

/**
 * Processes an approved transaction (internal)
 */
async function processTransaction(transactionId: string): Promise<void> {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction || transaction.status !== 'APPROVED') {
    return;
  }

  try {
    // Deduct from source account
    if (transaction.fromAccountId) {
      await updateAccountBalance(
        transaction.fromAccountId,
        Number(transaction.amount),
        'subtract'
      );
    }

    // Add to destination account
    if (transaction.toAccountId) {
      await updateAccountBalance(
        transaction.toAccountId,
        Number(transaction.amount),
        'add'
      );
    }

    // Mark as completed
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  } catch (error) {
    // Mark as failed
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'FAILED',
      },
    });
    throw error;
  }
}
