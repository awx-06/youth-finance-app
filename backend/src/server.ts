import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config, validateConfig } from './config';
import { errorHandler } from './middleware/errorHandler';
import { generalRateLimiter } from './middleware/rateLimit';
import { logger, logRequest } from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import accountRoutes from './routes/account.routes';
import transactionRoutes from './routes/transaction.routes';
import allowanceRoutes from './routes/allowance.routes';
import savingsGoalRoutes from './routes/savingsGoal.routes';
import notificationRoutes from './routes/notification.routes';

/**
 * Initialize Express application
 */
function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
    })
  );

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Cookie parser
  app.use(cookieParser());

  // Compression middleware
  app.use(compression());

  // Rate limiting
  app.use(generalRateLimiter);

  // Request logging middleware
  app.use((req: Request, res: Response, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logRequest(req.method, req.path, res.statusCode, duration);
    });
    
    next();
  });

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      environment: config.server.env,
    });
  });

  // API routes
  const apiPrefix = `/api/${config.server.apiVersion}`;
  
  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/users`, userRoutes);
  app.use(`${apiPrefix}/accounts`, accountRoutes);
  app.use(`${apiPrefix}/transactions`, transactionRoutes);
  app.use(`${apiPrefix}/allowances`, allowanceRoutes);
  app.use(`${apiPrefix}/savings-goals`, savingsGoalRoutes);
  app.use(`${apiPrefix}/notifications`, notificationRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      path: req.path,
    });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();

    // Create Express app
    const app = createApp();

    // Start listening
    const server = app.listen(config.server.port, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Youth Finance App API Server                            ║
║                                                           ║
║   Environment: ${config.server.env.padEnd(43)}║
║   Port: ${String(config.server.port).padEnd(50)}║
║   API Version: ${config.server.apiVersion.padEnd(44)}║
║                                                           ║
║   Server is running and ready to accept connections!      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('Server closed. Exiting process.');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export { createApp, startServer };
