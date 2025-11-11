import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

class DatabaseManager {
  private prisma: PrismaClient;
  private retryCount = 0;
  private maxRetries = 3;

  constructor() {
    this.prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Note: Event logging disabled due to TypeScript compatibility
    // In production, use external monitoring tools for query analysis
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info('Database connected successfully');
      this.retryCount = 0;
    } catch (error) {
      logger.error('Database connection failed', { error, attempt: this.retryCount + 1 });
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = Math.min(1000 * Math.pow(2, this.retryCount), 10000); // Exponential backoff, max 10s
        logger.info(`Retrying database connection in ${delay}ms`, { attempt: this.retryCount });
        
        setTimeout(() => this.connect(), delay);
      } else {
        logger.error('Max database connection retries exceeded');
        throw error;
      }
    }
  }

  async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        logger.warn('Database operation failed', { error, attempt });
        
        if (attempt === this.maxRetries) {
          logger.error('Database operation failed after all retries', { error });
          throw error;
        }
        
        const delay = Math.min(100 * Math.pow(2, attempt), 1000); // Exponential backoff, max 1s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Unexpected error in executeWithRetry');
  }

  getClient(): PrismaClient {
    return this.prisma;
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    logger.info('Database disconnected');
  }
}

export const databaseManager = new DatabaseManager();
export { databaseManager as default };
