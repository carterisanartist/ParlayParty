import { z } from 'zod';
import { logger } from './logger';

/**
 * Production configuration validation
 * Ensures all required environment variables are present and valid
 */

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1000).max(65535)).default(8080),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  SERVER_SALT: z.string().min(16, 'SERVER_SALT must be at least 16 characters'),
  UPLOADS_DIR: z.string().default('./uploads'),
  BACKUP_DIR: z.string().default('/data/backups'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  // Optional Discord webhook for alerts
  DISCORD_WEBHOOK_URL: z.string().url().optional(),
});

export type Config = z.infer<typeof configSchema>;

/**
 * Validate and parse environment configuration
 * Throws error if required variables are missing or invalid
 */
function validateConfig(): Config {
  try {
    const config = configSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL,
      REDIS_URL: process.env.REDIS_URL,
      SERVER_SALT: process.env.SERVER_SALT,
      UPLOADS_DIR: process.env.UPLOADS_DIR,
      BACKUP_DIR: process.env.BACKUP_DIR,
      LOG_LEVEL: process.env.LOG_LEVEL,
      DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
    });

    logger.info('Configuration validated successfully', {
      environment: config.NODE_ENV,
      port: config.PORT,
      logLevel: config.LOG_LEVEL
    });

    return config;
  } catch (error) {
    logger.error('Configuration validation failed', { error });
    
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ');
      
      throw new Error(`Invalid environment configuration: ${errorMessages}`);
    }
    
    throw error;
  }
}

// Export validated configuration
export const config = validateConfig();

/**
 * Check if we're in production environment
 */
export const isProduction = config.NODE_ENV === 'production';

/**
 * Check if we're in development environment
 */
export const isDevelopment = config.NODE_ENV === 'development';
