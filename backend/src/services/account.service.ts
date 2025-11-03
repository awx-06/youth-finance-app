import { PrismaClient, Account } from '@prisma/client';
import { NotFoundError, ForbiddenError, BadRequestError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * Creates a new account for a child
 */
export async function createAccount(
  userId: string,
  childId: string,
  name: string
): Promise<Account> {
  // Verify user has permission
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

  // Parents can create accounts for their children
  if (user.role === 'PARENT' && user.parentProfile) {
    const child = await prisma.childProfile.findUnique({
      where: { id: childId },
    });

    if (!child || child.parentId !== user.parentProfile.id) {
      throw new ForbiddenError('Cannot create account for this child');
    }
  } else if (user.role === 'CHILD' && user.childProfile) {
    // Children can only create accounts for themselves
    if (childId !== user.childProfile.id) {
      throw new ForbiddenError('Cannot create account for another child');
    }
  } else {
    throw new ForbiddenError('Invalid user role');
  }

  // Create account
  const account = await prisma.account.create({
    data: {
      childId,
      name,
      balance: 0,
    },
  });

  return account;
}

/**
 * Gets all accounts for a user
 */
export async function getAccounts(userId: string): Promise<Account[]> {
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

  // Parents see all accounts of their children
  if (user.role === 'PARENT' && user.parentProfile) {
    const accounts: Account[] = [];
    user.parentProfile.children.forEach((child) => {
      accounts.push(...child.accounts);
    });
    return accounts;
  }

  // Children see only their own accounts
  if (user.role === 'CHILD' && user.childProfile) {
    return user.childProfile.accounts;
  }

  return [];
}

/**
 * Gets a specific account by ID
 */
export async function getAccountById(userId: string, accountId: string): Promise<Account> {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      child: {
        include: {
          user: true,
          parent: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  // Verify user has permission to view this account
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

  // Check if user owns or has access to this account
  const hasAccess =
    (user.role === 'CHILD' && user.childProfile?.id === account.childId) ||
    (user.role === 'PARENT' && user.parentProfile?.id === account.child.parentId);

  if (!hasAccess) {
    throw new ForbiddenError('Access denied to this account');
  }

  return account;
}

/**
 * Gets account balance
 */
export async function getAccountBalance(
  userId: string,
  accountId: string
): Promise<{ balance: number }> {
  const account = await getAccountById(userId, accountId);
  return { balance: Number(account.balance) };
}

/**
 * Updates account balance (internal use only)
 */
export async function updateAccountBalance(
  accountId: string,
  amount: number,
  operation: 'add' | 'subtract'
): Promise<Account> {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  const currentBalance = Number(account.balance);
  let newBalance: number;

  if (operation === 'add') {
    newBalance = currentBalance + amount;
  } else {
    newBalance = currentBalance - amount;
    if (newBalance < 0) {
      throw new BadRequestError('Insufficient balance');
    }
  }

  return prisma.account.update({
    where: { id: accountId },
    data: { balance: newBalance },
  });
}
