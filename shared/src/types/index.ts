export enum UserRole {
  PARENT = 'PARENT',
  CHILD = 'CHILD',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export enum TransactionType {
  ALLOWANCE = 'ALLOWANCE',
  PURCHASE = 'PURCHASE',
  TRANSFER = 'TRANSFER',
  SAVINGS = 'SAVINGS',
  WITHDRAWAL = 'WITHDRAWAL',
  REFUND = 'REFUND',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  DECLINED = 'DECLINED',
  FAILED = 'FAILED',
}

export enum AllowanceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum NotificationType {
  TRANSACTION_CREATED = 'TRANSACTION_CREATED',
  TRANSACTION_APPROVED = 'TRANSACTION_APPROVED',
  TRANSACTION_DECLINED = 'TRANSACTION_DECLINED',
  ALLOWANCE_RECEIVED = 'ALLOWANCE_RECEIVED',
  SAVINGS_GOAL_REACHED = 'SAVINGS_GOAL_REACHED',
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  LOW_BALANCE = 'LOW_BALANCE',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  childId: string;
  name: string;
  balance: number;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  fromAccountId?: string;
  toAccountId?: string;
  type: TransactionType;
  amount: number;
  description?: string;
  status: TransactionStatus;
  approvedBy?: string;
  approvedAt?: string;
  completedAt?: string;
  declinedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Allowance {
  id: string;
  childId: string;
  amount: number;
  frequency: AllowanceFrequency;
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  childId: string;
  accountId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  isCompleted: boolean;
  completedAt?: string;
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
