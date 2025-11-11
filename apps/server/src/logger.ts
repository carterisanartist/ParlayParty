import winston from 'winston';

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'parlay-party-server' },
  transports: [
    // Write all logs to console in development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
        })
      )
    })
  ],
});

// Add file logging in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ 
    filename: '/var/log/parlay-party/error.log', 
    level: 'error' 
  }));
  logger.add(new winston.transports.File({ 
    filename: '/var/log/parlay-party/combined.log' 
  }));
}

// Convenience methods for common log patterns
export const gameLogger = {
  playerJoin: (playerId: string, roomCode: string, isReconnection: boolean) => {
    logger.info('Player joined/reconnected', { 
      playerId, 
      roomCode, 
      isReconnection,
      event: 'player_join'
    });
  },
  
  voteReceived: (playerId: string, parlayText: string, tVideoSec: number) => {
    logger.info('Vote received', { 
      playerId, 
      parlayText, 
      tVideoSec,
      event: 'vote_add'
    });
  },
  
  gameStateChange: (roomCode: string, fromStatus: string, toStatus: string) => {
    logger.info('Game state changed', { 
      roomCode, 
      fromStatus, 
      toStatus,
      event: 'state_change'
    });
  },
  
  error: (message: string, error: any, context?: object) => {
    logger.error(message, { error: error?.message, stack: error?.stack, ...context });
  }
};
