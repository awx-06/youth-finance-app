import winston from 'winston';
import { config } from '../config';

/**
 * Custom log levels
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Log colors for console output
 */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

/**
 * Log format
 */
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`
  )
);

/**
 * Transports for different environments
 */
const transports = [
  // Console transport
  new winston.transports.Console(),
  
  // Error log file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: 'logs/combined.log',
  }),
];

/**
 * Logger instance
 */
export const logger = winston.createLogger({
  level: config.server.isDevelopment ? 'debug' : 'info',
  levels,
  format,
  transports,
  exitOnError: false,
});

/**
 * Log HTTP requests
 * @param method - HTTP method
 * @param url - Request URL
 * @param statusCode - Response status code
 * @param duration - Request duration in ms
 */
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number
): void {
  logger.http(`${method} ${url} ${statusCode} - ${duration}ms`);
}

/**
 * Log errors with stack trace
 * @param error - Error object
 * @param context - Additional context
 */
export function logError(error: Error, context?: Record<string, unknown>): void {
  logger.error(`${error.message}${context ? ` | Context: ${JSON.stringify(context)}` : ''}`);
  if (error.stack) {
    logger.error(error.stack);
  }
}

/**
 * Log info messages
 * @param message - Log message
 * @param metadata - Additional metadata
 */
export function logInfo(message: string, metadata?: Record<string, unknown>): void {
  logger.info(`${message}${metadata ? ` | ${JSON.stringify(metadata)}` : ''}`);
}

/**
 * Log warning messages
 * @param message - Warning message
 * @param metadata - Additional metadata
 */
export function logWarning(message: string, metadata?: Record<string, unknown>): void {
  logger.warn(`${message}${metadata ? ` | ${JSON.stringify(metadata)}` : ''}`);
}

/**
 * Log debug messages
 * @param message - Debug message
 * @param metadata - Additional metadata
 */
export function logDebug(message: string, metadata?: Record<string, unknown>): void {
  logger.debug(`${message}${metadata ? ` | ${JSON.stringify(metadata)}` : ''}`);
}
