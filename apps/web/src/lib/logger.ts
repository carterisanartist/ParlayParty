// Client-side logging utility

interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

class ClientLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogEntry['level'], message: string, context?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private log(entry: LogEntry) {
    if (this.isDevelopment) {
      const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}:`;
      const contextStr = entry.context ? JSON.stringify(entry.context, null, 2) : '';
      
      console.log(prefix, entry.message, contextStr);
    } else {
      // In production, could send to external logging service
      // For now, just use console for critical errors
      if (entry.level === 'error') {
        console.error(entry);
      }
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: Record<string, any>) {
    this.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(this.formatMessage('warn', message, context));
  }

  error(message: string, context?: Record<string, any>) {
    this.log(this.formatMessage('error', message, context));
  }
}

export const logger = new ClientLogger();
