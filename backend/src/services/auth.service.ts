import { PrismaClient, User } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokenPair, verifyRefreshToken, JwtPayload } from '../utils/jwt';
import { UnauthorizedError, ConflictError, BadRequestError } from '../middleware/errorHandler';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

const prisma = new PrismaClient();

/**
 * Registers a new user
 */
export async function registerUser(data: RegisterInput): Promise<{
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;
}> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // Validate child registration
  if (data.role === 'CHILD') {
    if (!data.parentId) {
      throw new BadRequestError('Parent ID required for child registration');
    }
    if (!data.dateOfBirth) {
      throw new BadRequestError('Date of birth required for child registration');
    }

    // Verify parent exists
    const parent = await prisma.parentProfile.findUnique({
      where: { id: data.parentId },
    });

    if (!parent) {
      throw new BadRequestError('Invalid parent ID');
    }
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create user with profile
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      ...(data.role === 'PARENT' && {
        parentProfile: {
          create: {},
        },
      }),
      ...(data.role === 'CHILD' && data.parentId && data.dateOfBirth && {
        childProfile: {
          create: {
            parentId: data.parentId,
            dateOfBirth: new Date(data.dateOfBirth),
          },
        },
      }),
    },
    include: {
      parentProfile: true,
      childProfile: true,
    },
  });

  // Generate tokens
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const { accessToken, refreshToken } = generateTokenPair(payload);

  // Store refresh token in session
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Remove password hash from response
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
}

/**
 * Authenticates a user and returns tokens
 */
export async function loginUser(data: LoginInput): Promise<{
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;
}> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      parentProfile: true,
      childProfile: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new UnauthorizedError('Account is inactive');
  }

  // Verify password
  const isValidPassword = await comparePassword(data.password, user.passwordHash);

  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate tokens
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const { accessToken, refreshToken } = generateTokenPair(payload);

  // Store refresh token in session
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Remove password hash from response
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
}

/**
 * Refreshes access token using refresh token
 */
export async function refreshAccessToken(token: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  // Verify refresh token
  let payload: JwtPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Check if refresh token exists in database
  const session = await prisma.session.findUnique({
    where: { refreshToken: token },
    include: { user: true },
  });

  if (!session) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    throw new UnauthorizedError('Refresh token expired');
  }

  // Generate new tokens
  const newTokens = generateTokenPair({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
  });

  // Delete old session and create new one
  await prisma.session.delete({ where: { id: session.id } });
  await prisma.session.create({
    data: {
      userId: session.user.id,
      refreshToken: newTokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return newTokens;
}

/**
 * Logs out a user by deleting their session
 */
export async function logoutUser(refreshToken: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { refreshToken },
  });
}
