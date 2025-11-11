import { logger } from './logger';

const DISCORD_WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1437685302784299080/nbTAQk_GGmka1MxdkNMYiJg9bQc6d2iz6b1Fx9e63o7K-Zz6HpDgZis8gsN122-vTyTo';

interface AlertPayload {
  title: string;
  description: string;
  color?: number;
  timestamp?: string;
}

export class AlertManager {
  async sendAlert(payload: AlertPayload): Promise<void> {
    if (!DISCORD_WEBHOOK_URL || process.env.NODE_ENV !== 'production') {
      logger.info('Alert (dev mode)', payload);
      return;
    }

    try {
      const discordPayload = {
        embeds: [{
          title: payload.title,
          description: payload.description,
          color: payload.color || 15158332, // Red color for alerts
          timestamp: payload.timestamp || new Date().toISOString(),
          footer: {
            text: 'Parlay Party Monitoring'
          }
        }]
      };

      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discordPayload),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status}`);
      }

      logger.info('Alert sent to Discord', { title: payload.title });
    } catch (error) {
      logger.error('Failed to send Discord alert', { error, payload });
    }
  }

  // Specific alert methods
  async serverStarted(port: number) {
    await this.sendAlert({
      title: '🚀 Server Started',
      description: `Parlay Party server is online on port ${port}`,
      color: 3066993, // Green
    });
  }

  async serverError(error: any, context?: any) {
    await this.sendAlert({
      title: '🚨 Server Error',
      description: `Critical error detected: ${error.message || error}`,
      color: 15158332, // Red
    });
  }

  async databaseBackupCompleted(filename: string) {
    await this.sendAlert({
      title: '💾 Database Backup Complete',
      description: `Database backup created: ${filename}`,
      color: 3066993, // Green
    });
  }

  async databaseBackupFailed(error: any) {
    await this.sendAlert({
      title: '⚠️ Database Backup Failed',
      description: `Backup process failed: ${error.message || error}`,
      color: 15105570, // Orange
    });
  }

  async highErrorRate(errorCount: number, timeWindow: string) {
    await this.sendAlert({
      title: '📈 High Error Rate Detected',
      description: `${errorCount} errors in the last ${timeWindow}`,
      color: 15105570, // Orange
    });
  }
}

export const alertManager = new AlertManager();
