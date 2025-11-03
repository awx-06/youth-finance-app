import { PrismaClient } from '@prisma/client';
import type { User } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler';
import { UpdateProfileInput, LinkChildInput } from '../validators/user.validator';

const prisma = new PrismaClient();

/**
 * Gets user profile by ID
 */
export async function getUserProfile(userId: string): Promise<Omit<User, 'passwordHash'>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      parentProfile: true,
      childProfile: {
        include: {
          parent: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
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

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Updates user profile
 */
export async function updateUserProfile(
  userId: string,
  data: UpdateProfileInput
): Promise<Omit<User, 'passwordHash'>> {
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

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
    },
    include: {
      parentProfile: true,
      childProfile: true,
    },
  });

  // Update profile-specific fields
  if (user.role === 'PARENT' && user.parentProfile) {
    await prisma.parentProfile.update({
      where: { id: user.parentProfile.id },
      data: {
        ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
        ...(data.address && { address: data.address }),
      },
    });
  }

  const { passwordHash: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
}

/**
 * Links a child to a parent
 */
export async function linkChildToParent(
  parentUserId: string,
  data: LinkChildInput
): Promise<void> {
  // Verify parent exists
  const parent = await prisma.user.findUnique({
    where: { id: parentUserId },
    include: { parentProfile: true },
  });

  if (!parent || parent.role !== 'PARENT' || !parent.parentProfile) {
    throw new ForbiddenError('Only parents can link children');
  }

  // Verify child exists
  const child = await prisma.user.findUnique({
    where: { id: data.childId },
    include: { childProfile: true },
  });

  if (!child || child.role !== 'CHILD' || !child.childProfile) {
    throw new NotFoundError('Child not found');
  }

  // Update child profile with parent reference
  await prisma.childProfile.update({
    where: { id: child.childProfile.id },
    data: {
      parentId: parent.parentProfile.id,
    },
  });
}

/**
 * Gets all children for a parent
 */
export async function getChildren(parentUserId: string) {
  const parent = await prisma.user.findUnique({
    where: { id: parentUserId },
    include: { parentProfile: true },
  });

  if (!parent || parent.role !== 'PARENT' || !parent.parentProfile) {
    throw new ForbiddenError('Only parents can view children');
  }

  const children = await prisma.childProfile.findMany({
    where: { parentId: parent.parentProfile.id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          createdAt: true,
        },
      },
      accounts: {
        select: {
          id: true,
          name: true,
          balance: true,
          status: true,
        },
      },
    },
  });

  return children;
}
