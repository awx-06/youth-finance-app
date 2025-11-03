# Database Schema

This document describes the database schema for the Youth Finance App.

## Overview

The application uses PostgreSQL as the database with Prisma as the ORM. The schema is designed to support a multi-user financial management system for children and parents.

## Models

### User
Core user model for both parents and children.

**Fields:**
- `id` (UUID): Primary key
- `email` (String): Unique email address
- `passwordHash` (String): Hashed password
- `firstName` (String): User's first name
- `lastName` (String): User's last name
- `role` (UserRole): PARENT or CHILD
- `isActive` (Boolean): Account status
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relationships:**
- Has one ParentProfile (if role is PARENT)
- Has one ChildProfile (if role is CHILD)
- Has many Sessions
- Has many AuditLogs

### ParentProfile
Extended profile for parent users.

**Fields:**
- `id` (UUID): Primary key
- `userId` (UUID): Foreign key to User
- `phoneNumber` (String, optional): Contact number
- `address` (String, optional): Physical address
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relationships:**
- Belongs to User
- Has many ChildProfiles

### ChildProfile
Extended profile for child users.

**Fields:**
- `id` (UUID): Primary key
- `userId` (UUID): Foreign key to User
- `parentId` (UUID): Foreign key to ParentProfile
- `dateOfBirth` (DateTime): Child's birth date
- `allowanceLimit` (Decimal): Maximum allowance amount
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relationships:**
- Belongs to User
- Belongs to ParentProfile
- Has many Accounts
- Has many Allowances
- Has many SavingsGoals

### Account
Financial accounts for children.

**Fields:**
- `id` (UUID): Primary key
- `childId` (UUID): Foreign key to ChildProfile
- `name` (String): Account name
- `balance` (Decimal): Current balance
- `status` (AccountStatus): ACTIVE, SUSPENDED, or CLOSED
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relationships:**
- Belongs to ChildProfile
- Has many Transactions (as source)
- Has many Transactions (as destination)
- Has many SavingsGoals

### Transaction
Financial transactions between accounts.

**Fields:**
- `id` (UUID): Primary key
- `fromAccountId` (UUID, optional): Source account
- `toAccountId` (UUID, optional): Destination account
- `type` (TransactionType): ALLOWANCE, PURCHASE, TRANSFER, etc.
- `amount` (Decimal): Transaction amount
- `description` (String, optional): Transaction description
- `status` (TransactionStatus): PENDING, APPROVED, COMPLETED, etc.
- `approvedBy` (UUID, optional): User who approved
- `approvedAt` (DateTime, optional)
- `completedAt` (DateTime, optional)
- `declinedReason` (String, optional)
- `metadata` (JSON, optional): Additional data
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relationships:**
- Belongs to Account (source)
- Belongs to Account (destination)

### Allowance
Recurring allowance schedules for children.

**Fields:**
- `id` (UUID): Primary key
- `childId` (UUID): Foreign key to ChildProfile
- `amount` (Decimal): Allowance amount
- `frequency` (AllowanceFrequency): DAILY, WEEKLY, or MONTHLY
- `startDate` (DateTime): Start date
- `endDate` (DateTime, optional): End date
- `nextDueDate` (DateTime): Next payment date
- `isActive` (Boolean): Active status
- `description` (String, optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relationships:**
- Belongs to ChildProfile

### SavingsGoal
Savings goals for children.

**Fields:**
- `id` (UUID): Primary key
- `childId` (UUID): Foreign key to ChildProfile
- `accountId` (UUID): Foreign key to Account
- `name` (String): Goal name
- `targetAmount` (Decimal): Target amount
- `currentAmount` (Decimal): Current progress
- `deadline` (DateTime, optional): Target date
- `isCompleted` (Boolean): Completion status
- `completedAt` (DateTime, optional)
- `imageUrl` (String, optional): Goal image
- `description` (String, optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relationships:**
- Belongs to ChildProfile
- Belongs to Account

### Notification
User notifications.

**Fields:**
- `id` (UUID): Primary key
- `userId` (UUID): Foreign key to User
- `type` (NotificationType): Notification category
- `title` (String): Notification title
- `message` (String): Notification message
- `isRead` (Boolean): Read status
- `readAt` (DateTime, optional)
- `metadata` (JSON, optional): Additional data
- `createdAt` (DateTime)

### Session
User authentication sessions.

**Fields:**
- `id` (UUID): Primary key
- `userId` (UUID): Foreign key to User
- `refreshToken` (String): JWT refresh token
- `ipAddress` (String, optional): Client IP
- `userAgent` (String, optional): Client user agent
- `expiresAt` (DateTime): Expiration time
- `createdAt` (DateTime)

**Relationships:**
- Belongs to User

### AuditLog
Audit trail for important actions.

**Fields:**
- `id` (UUID): Primary key
- `userId` (UUID): Foreign key to User
- `action` (String): Action performed
- `entityType` (String): Type of entity affected
- `entityId` (UUID): ID of entity affected
- `changes` (JSON, optional): Change details
- `ipAddress` (String, optional): Client IP
- `userAgent` (String, optional): Client user agent
- `createdAt` (DateTime)

**Relationships:**
- Belongs to User

## Enums

### UserRole
- PARENT
- CHILD

### AccountStatus
- ACTIVE
- SUSPENDED
- CLOSED

### TransactionType
- ALLOWANCE
- PURCHASE
- TRANSFER
- SAVINGS
- WITHDRAWAL
- REFUND

### TransactionStatus
- PENDING
- APPROVED
- COMPLETED
- DECLINED
- FAILED

### AllowanceFrequency
- DAILY
- WEEKLY
- MONTHLY

### NotificationType
- TRANSACTION_CREATED
- TRANSACTION_APPROVED
- TRANSACTION_DECLINED
- ALLOWANCE_RECEIVED
- SAVINGS_GOAL_REACHED
- ACCOUNT_CREATED
- LOW_BALANCE

## Indexes

The schema includes indexes on:
- All foreign keys
- Frequently queried fields (email, role, status, etc.)
- Date fields used for filtering (createdAt, nextDueDate, etc.)

## Security Considerations

1. **Password Storage**: Passwords are hashed using bcrypt
2. **Sensitive Data**: Financial data uses appropriate decimal types
3. **Audit Trail**: All important actions are logged in AuditLog
4. **Soft Deletes**: Accounts can be suspended rather than deleted
5. **Data Integrity**: Foreign key constraints ensure referential integrity
