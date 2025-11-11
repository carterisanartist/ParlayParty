import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import databaseManager from './database';
import { logger } from './logger';
import { metricsCollector } from './metrics';
import { alertManager } from './alerts';
import { backupManager } from './backup';
import { setupSocketHandlers } from './socket-handlers';
import redis from './redis';
import { upload } from './upload';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://parlay-party.fly.dev', 'https://www.parlay-party.fly.dev']
      : '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const prisma = databaseManager.getClient();
const PORT = process.env.PORT || 8080;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "https:", "data:", "blob:"],
      mediaSrc: ["'self'", "https:", "data:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-eval'", "https://www.youtube.com", "https://s.ytimg.com"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://www.tiktok.com"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(cors());
app.use(express.json());

app.get('/healthz', (req, res) => {
  res.json({
    ok: true,
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

app.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    
    const { roundId } = req.body;
    const videoUrl = `/media/${roundId || 'temp'}/${req.file.filename}`;
    
    res.json({
      success: true,
      videoUrl,
      filename: req.file.filename,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

app.get('/tyler-sound', (req, res) => {
  try {
    const soundPath = path.join(__dirname, '../EasterEgg/My Song 8.wav');
    
    if (!fs.existsSync(soundPath)) {
      return res.status(404).json({ error: 'Tyler sound not found' });
    }
    
    res.setHeader('Content-Type', 'audio/wav');
    fs.createReadStream(soundPath).pipe(res);
  } catch (error) {
    console.error('Error serving Tyler sound:', error);
    res.status(500).json({ error: 'Failed to serve sound' });
  }
});

app.get('/pizza-hut-logo', (req, res) => {
  try {
    const logoPath = path.join(__dirname, '../EasterEgg/Pizza_Hut_international_logo_2014.svg.svg');
    
    if (!fs.existsSync(logoPath)) {
      return res.status(404).json({ error: 'Pizza Hut logo not found' });
    }
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    fs.createReadStream(logoPath).pipe(res);
  } catch (error) {
    console.error('Error serving Pizza Hut logo:', error);
    res.status(500).json({ error: 'Failed to serve logo' });
  }
});

app.get('/media/:roundId/:filename', async (req, res) => {
  try {
    const { roundId, filename } = req.params;
    const uploadsDir = process.env.UPLOADS_DIR || (process.env.NODE_ENV === 'production' ? '/data/uploads' : './uploads');
    const filePath = path.join(uploadsDir, roundId, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });
      
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });
      
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error('Error streaming media:', error);
    res.status(500).json({ error: 'Failed to stream media' });
  }
});

io.use((socket, next) => {
  const roomCode = socket.handshake.query.roomCode as string;
  if (roomCode) {
    socket.data.roomCode = roomCode;
  }
  next();
});

setupSocketHandlers(io);

// Track socket connections for metrics
io.on('connection', (socket) => {
  metricsCollector.incrementConnections();
  
  socket.on('disconnect', () => {
    metricsCollector.decrementConnections();
  });
});

const webBuildDir = path.resolve(__dirname, '../../web/.next');
const webPublicDir = path.resolve(__dirname, '../../web/public');

if (fs.existsSync(webBuildDir) && process.env.NODE_ENV === 'production') {
  console.log('Serving Next.js production build');
  const next = require('next');
  const nextApp = next({
    dev: false,
    dir: path.resolve(__dirname, '../../web'),
  });
  
  nextApp.prepare().then(() => {
    const handle = nextApp.getRequestHandler();
    app.all('*', (req, res) => {
      if (req.path.startsWith('/media/') || req.path.startsWith('/upload') || req.path.startsWith('/healthz')) {
        return;
      }
      return handle(req, res);
    });
  }).catch((err: any) => {
    console.error('Error starting Next.js:', err);
  });
} else {
  console.log('Next.js not available - API only mode');
  app.get('*', (req, res) => {
    res.json({ 
      message: 'Parlay Party API',
      endpoints: {
        healthz: '/healthz',
        upload: 'POST /upload',
        media: '/media/:roundId/:filename'
      }
    });
  });
}

async function bootstrap() {
  try {
    console.log('Running Prisma migrations...');
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Migrations completed');
  } catch (error) {
    console.error('Migration failed:', error);
  }
  
  await databaseManager.connect();
  
  httpServer.listen(Number(PORT), '0.0.0.0', async () => {
    logger.info('Server started', {
      host: '0.0.0.0',
      port: PORT,
      environment: process.env.NODE_ENV,
      healthCheck: `/healthz`,
      timestamp: new Date().toISOString()
    });
    
    // Send startup alert
    await alertManager.serverStarted(Number(PORT));
    
    // Start database backup scheduler
    await backupManager.scheduleBackups();
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, starting graceful shutdown');
  
  try {
    await databaseManager.disconnect();
    await redis.quit();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, starting graceful shutdown');
  
  try {
    await databaseManager.disconnect();
    await redis.quit();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  await redis.quit();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

