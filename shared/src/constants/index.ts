export const API_VERSION = 'v1';

export const PASSWORD_MIN_LENGTH = 8;

export const TRANSACTION_LIMITS = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 10000,
};

export const ALLOWANCE_LIMITS = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 1000,
};

export const SAVINGS_GOAL_LIMITS = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 100000,
};

export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
};
