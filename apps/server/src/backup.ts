import { spawn } from 'child_process';
import { logger } from './logger';
import path from 'path';
import fs from 'fs';

export class BackupManager {
  private backupDir = process.env.BACKUP_DIR || '/data/backups';

  constructor() {
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createDatabaseBackup(): Promise<string> {
    return new Promise((resolve, reject) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `backup-${timestamp}.sql`);
      
      const pg_dump = spawn('pg_dump', [
        process.env.DATABASE_URL || '',
        '-f',
        backupFile,
        '--verbose'
      ]);

      pg_dump.stdout.on('data', (data) => {
        logger.info('Backup progress', { data: data.toString() });
      });

      pg_dump.stderr.on('data', (data) => {
        logger.error('Backup error', { error: data.toString() });
      });

      pg_dump.on('close', (code) => {
        if (code === 0) {
          logger.info('Database backup completed', { file: backupFile });
          resolve(backupFile);
        } else {
          reject(new Error(`Backup failed with code ${code}`));
        }
      });
    });
  }

  async scheduleBackups() {
    // Schedule daily backups at 3 AM
    const scheduleBackup = () => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(3, 0, 0, 0);
      
      if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      const timeUntilBackup = scheduledTime.getTime() - now.getTime();
      
      setTimeout(async () => {
        try {
          await this.createDatabaseBackup();
          await this.cleanupOldBackups();
        } catch (error) {
          logger.error('Scheduled backup failed', { error });
        }
        
        // Schedule next backup
        scheduleBackup();
      }, timeUntilBackup);
    };

    if (process.env.NODE_ENV === 'production') {
      scheduleBackup();
      logger.info('Database backup scheduler started');
    }
  }

  async cleanupOldBackups(): Promise<void> {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stats: fs.statSync(path.join(this.backupDir, file))
        }))
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Keep only last 7 backups
      const filesToDelete = files.slice(7);
      
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        logger.info('Old backup deleted', { file: file.name });
      }
    } catch (error) {
      logger.error('Backup cleanup failed', { error });
    }
  }
}

export const backupManager = new BackupManager();
