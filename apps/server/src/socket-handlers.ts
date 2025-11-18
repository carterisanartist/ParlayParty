import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import databaseManager from './database';
import {
  normalizeText,
  generateRoomCode,
  DEFAULT_ROOM_SETTINGS,
  selectWeightedRandom,
  createCommitSeed,
  RoomSettings,
} from '@parlay-party/shared';
import { calculateEventScore, determineLoser } from './scoring';
import { clusterVotes, shouldAutoPause, checkTwoPlayerConsensus } from './clustering';
import redis from './redis';
import { 
  validateInput, 
  checkRateLimit, 
  playerJoinSchema, 
  parlaySubmitSchema,
  voteAddSchema 
} from './validation';
import { setupWebRTCHandlers } from './webrtc-handlers';
import { logger, gameLogger } from './logger';
import { cacheManager } from './cache';
import { speedScoring } from './scoring/speed-scoring';
import { teamManager } from './teams/team-manager';
import { initializePowerUpManager, PowerUpType } from './powerups';

const prisma = databaseManager.getClient();
const powerUpManager = initializePowerUpManager(prisma);

/**
 * Socket connection data attached to each socket instance
 * Contains room context and player identification
 */
interface SocketData {
  roomCode?: string;
  playerId?: string;
}

/**
 * Sets up all Socket.io event handlers for real-time game communication
 * Handles player joins, votes, game state management, and room updates
 * 
 * @param io - Socket.io server instance
 */
export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    logger.info('Client connected', { socketId: socket.id, timestamp: new Date().toISOString() });
    
    const data = socket.data as SocketData;
    
    /**
     * Handle player joining a room
     * Supports both new players and reconnections
     * Validates input and manages room/player state
     */
    socket.on('player:join', async ({ name, avatarUrl }, callback) => {
      try {
        // Rate limiting
        if (!checkRateLimit(socket.id, 5, 60000)) {
          return callback({ error: 'Too many requests. Please wait.' } as any);
        }

        // Input validation
        const validatedInput = validateInput(playerJoinSchema, { name, avatarUrl });
        
        const roomCode = data.roomCode;
        if (!roomCode) {
          return callback({ error: 'No room code provided' } as any);
        }
        
        let room = await prisma.room.findUnique({ where: { code: roomCode } });
        
        if (!room) {
          const newRoom = await prisma.room.create({
            data: {
              code: roomCode,
              hostId: 'temp',
              status: 'lobby',
              settings: DEFAULT_ROOM_SETTINGS as any,
            },
          });
          room = newRoom;
        }
        
        // RECONNECTION FIX: Check if player already exists
        let player = await prisma.player.findFirst({
          where: { roomId: room.id, name }
        });
        
        let isNewPlayer = false;

        if (player) {
          gameLogger.playerJoin(player.id, roomCode, true);
          // Update existing player
          player = await prisma.player.update({
            where: { id: player.id },
            data: { avatarUrl: validatedInput.avatarUrl },
          });
        } else {
          const existingPlayers = await prisma.player.count({ where: { roomId: room.id } });
          const isHost = existingPlayers === 0;
          
          // Create new player
          player = await prisma.player.create({
            data: {
              roomId: room.id,
              name: validatedInput.name,
              avatarUrl: validatedInput.avatarUrl,
              isHost,
            },
          });
          
          isNewPlayer = true;
        }
        
        // If this is the first player, make them the host
        if (!room.hostId || room.hostId === 'temp') {
          await prisma.room.update({
            where: { id: room.id },
            data: { hostId: player.id },
          });
          room.hostId = player.id;
          player.isHost = true;
        }
        
        data.playerId = player.id;
        socket.join(`room:${roomCode}`);
        
        const currentRound = await prisma.round.findFirst({
          where: { roomId: room.id },
          orderBy: { index: 'desc' },
        });
        
        // Tyler easter egg - only for new players
        if (isNewPlayer && name.toLowerCase().includes('tyler')) {
          console.log('🎵 Tyler joined! Playing sound...');
          io.to(`room:${roomCode}`).emit('tyler:sound');
        }
        
        // Only broadcast player:joined for new players
        if (isNewPlayer) {
          io.to(`room:${roomCode}`).emit('player:joined', { player });
          // Initialize power-ups for new player
          powerUpManager.initializePlayer(player.id);
        }
        
        const allPlayers = await prisma.player.findMany({ where: { roomId: room.id } });
        io.to(`room:${roomCode}`).emit('roster:update', { players: allPlayers });
        
        callback({ player, room, round: currentRound || undefined });
      } catch (error) {
        gameLogger.error('Error joining room', error, { roomCode: data.roomCode, name });
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Vote handler - SIMPLIFIED AND WORKING
    socket.on('vote:add', async ({ tVideoSec, normalizedText, parlayText }) => {
      try {
        // Rate limiting - stricter for votes
        if (!checkRateLimit(socket.id, 20, 60000)) {
          console.log('❌ Rate limit exceeded for vote:add');
          return;
        }

        // Input validation
        const validatedInput = validateInput(voteAddSchema, { tVideoSec, normalizedText, parlayText });
        
        const { roomCode, playerId } = data;
        
        gameLogger.voteReceived(playerId!, validatedInput.parlayText, validatedInput.tVideoSec);
        if (!roomCode || !playerId) {
          console.log('❌ Missing roomCode or playerId');
          return;
        }
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        const round = await prisma.round.findFirst({
          where: { roomId: room!.id, status: 'video' },
          orderBy: { index: 'desc' },
        });
        
        if (!round) {
          console.log('❌ No video round found');
          return;
        }
        
        // Adjust for stream delay
        let adjustedVideoSec = tVideoSec;
        if (round.streamDelaySec && round.streamDelaySec > 0) {
          adjustedVideoSec = tVideoSec - round.streamDelaySec;
          console.log(`🕐 Adjusting for stream delay: ${tVideoSec}s -> ${adjustedVideoSec}s (${round.streamDelaySec}s delay)`);
        }
        
        // Get all players to check if solo
        const allPlayers = await prisma.player.findMany({ where: { roomId: room!.id } });
        const otherPlayers = allPlayers.filter(p => p.id !== playerId);
        
        logger.debug('Vote processing', { 
          roomPlayers: allPlayers.length, 
          otherPlayers: otherPlayers.length,
          playerId 
        });
        
        // Check for double points power-up
        let pointsToAward = 1;
        if (powerUpManager.hasDoublePoints(playerId)) {
          pointsToAward = 2;
          powerUpManager.consumeDoublePoints(playerId);
          console.log(`⚡ Double points activated for ${playerId}!`);
        }

        // Award points immediately and pause video
        await prisma.player.update({
          where: { id: playerId },
          data: { scoreTotal: { increment: pointsToAward } },
        });
        
        // Find the parlay for punishment info
        const punishmentParlay = await prisma.parlay.findFirst({
          where: { roundId: round.id, normalizedText },
          include: { player: true },
        });
        
        // Mark as used if "once" frequency
        if (punishmentParlay?.frequency === 'once') {
          await prisma.parlay.update({
            where: { id: punishmentParlay.id },
            data: { isUsed: true },
          });
          logger.info('Parlay marked as used', { parlayId: punishmentParlay.id, frequency: 'once' });
        }
        
        const caller = await prisma.player.findUnique({ where: { id: playerId } });
        
        logger.info('Vote processed successfully', { playerId, eventText: normalizedText, points: 1 });
        
        // Broadcast pause immediately  
        io.to(`room:${roomCode}`).emit('event:confirmed', { event: { normalizedText } });
        io.to(`room:${roomCode}`).emit('video:pause_auto', {
          tCenter: adjustedVideoSec,
          normalizedText,
          voters: [playerId],
          punishment: punishmentParlay?.punishment || null,
          callerName: caller?.name || 'Player',
          writerName: punishmentParlay?.player?.name || caller?.name || 'Player',
        });
        
        // Resume after 20 seconds
        const settings = room!.settings as any as RoomSettings;
        setTimeout(() => {
          io.to(`room:${roomCode}`).emit('video:resume');
        }, (settings.pauseDurationSec || 20) * 1000);
        
      } catch (error) {
        gameLogger.error('Error in vote:add', error, { 
          playerId: data.playerId, 
          roomCode: data.roomCode 
        });
        socket.emit('error', { message: 'Failed to add vote' });
      }
    });

    socket.on('queue:add', async ({ videoType, videoUrl, videoId, title, streamPlatform }) => {
      try {
        const { roomCode, playerId } = data;
        if (!roomCode || !playerId) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room) return;
        
        const player = await prisma.player.findUnique({ where: { id: playerId } });
        if (!player) return;
        
        const maxOrder = await prisma.videoQueue.findFirst({
          where: { roomId: room.id },
          orderBy: { order: 'desc' },
        });
        
        await prisma.videoQueue.create({
          data: {
            roomId: room.id,
            videoType,
            videoId,
            videoUrl,
            title,
            streamPlatform,
            addedBy: player.name,
            order: (maxOrder?.order || -1) + 1,
          },
        });
        
        const allVideos = await prisma.videoQueue.findMany({
          where: { roomId: room.id },
          orderBy: { order: 'asc' },
        });
        
        io.to(`room:${roomCode}`).emit('queue:updated', { videos: allVideos });
      } catch (error) {
        console.error('Error adding to queue:', error);
        socket.emit('error', { message: 'Failed to add video' });
      }
    });

    socket.on('parlay:submit', async ({ text, punishment, frequency }) => {
      try {
        const { roomCode, playerId } = data;
        if (!roomCode || !playerId) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room) return;
        
        const round = await prisma.round.findFirst({
          where: { roomId: room.id, status: 'parlay' },
          orderBy: { index: 'desc' },
        });
        if (!round) return;
        
        const normalized = normalizeText(text);
        
        const existingParlay = await prisma.parlay.findFirst({
          where: { roundId: round.id, playerId },
        });

        if (existingParlay) {
          await prisma.parlay.update({
            where: { id: existingParlay.id },
            data: { text, normalizedText: normalized, punishment, frequency: frequency || 'once' },
          });
        } else {
          await prisma.parlay.create({
            data: {
              roundId: round.id,
              playerId,
              text,
              normalizedText: normalized,
              punishment,
              frequency: frequency || 'once',
            },
          });
        }
        
        io.to(`room:${roomCode}`).emit('parlay:progress', { playerId, submitted: true });
      } catch (error) {
        console.error('Error submitting parlay:', error);
        socket.emit('error', { message: 'Failed to submit parlay' });
      }
    });

    socket.on('parlay:lock', async () => {
      try {
        const { roomCode, playerId } = data;
        if (!roomCode || !playerId) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room || room.hostId !== playerId) return;
        
        const round = await prisma.round.findFirst({
          where: { roomId: room.id, status: 'parlay' },
          orderBy: { index: 'desc' },
        });
        if (!round) return;
        
        await prisma.round.update({
          where: { id: round.id },
          data: { status: 'video' },
        });
        
        await prisma.room.update({
          where: { id: room.id },
          data: { status: 'video' },
        });
        
        // Fetch and broadcast all parlays - SIMPLIFIED for better compatibility
        const allParlays = await prisma.parlay.findMany({
          where: { roundId: round.id },
        });
        
        // Convert to plain objects
        const parlaysToSend = allParlays.map(p => ({
          id: p.id,
          text: p.text,
          normalizedText: p.normalizedText,
          playerId: p.playerId,
          punishment: p.punishment,
        }));
        
        console.log('Broadcasting parlays:', parlaysToSend.length);
        
        io.to(`room:${roomCode}`).emit('parlay:locked');
        io.to(`room:${roomCode}`).emit('parlay:all', { parlays: parlaysToSend });
        io.to(`room:${roomCode}`).emit('round:status', { status: 'video' });
      } catch (error) {
        console.error('Error locking parlays:', error);
        socket.emit('error', { message: 'Failed to lock parlays' });
      }
    });
    
    // Handle request for parlays from players
    socket.on('player:requestParlays', async () => {
      try {
        const { roomCode } = data;
        if (!roomCode) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room) return;
        
        const round = await prisma.round.findFirst({
          where: { roomId: room.id, status: 'video' },
          orderBy: { index: 'desc' },
        });
        
        if (!round) return;
        
        const allParlays = await prisma.parlay.findMany({
          where: { roundId: round.id },
        });
        
        const parlaysToSend = allParlays.map(p => ({
          id: p.id,
          text: p.text,
          normalizedText: p.normalizedText,
          playerId: p.playerId,
          punishment: p.punishment,
        }));
        
        console.log('Sending parlays to requesting player:', parlaysToSend.length);
        socket.emit('parlay:all', { parlays: parlaysToSend });
      } catch (error) {
        console.error('Error requesting parlays:', error);
      }
    });

    socket.on('host:startFromQueue', async () => {
      try {
        const { roomCode, playerId } = data;
        if (!roomCode || !playerId) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room || room.hostId !== playerId) return;
        
        const nextVideo = await prisma.videoQueue.findFirst({
          where: { roomId: room.id },
          orderBy: { order: 'asc' },
        });
        
        if (!nextVideo) {
          socket.emit('error', { message: 'No videos in queue' });
          return;
        }
        
        const lastRound = await prisma.round.findFirst({
          where: { roomId: room.id },
          orderBy: { index: 'desc' },
        });
        
        const newIndex = (lastRound?.index || 0) + 1;
        
        // Reset all parlays for new round
        if (lastRound) {
          await prisma.parlay.updateMany({
            where: { roundId: lastRound.id },
            data: { isUsed: false },
          });
        }
        
        // Default stream delay based on platform
        let streamDelaySec = undefined;
        if (nextVideo.streamPlatform) {
          streamDelaySec = nextVideo.streamPlatform === 'twitch' ? 10 : 7;
        }

        const round = await prisma.round.create({
          data: {
            roomId: room.id,
            index: newIndex,
            videoType: nextVideo.videoType,
            videoId: nextVideo.videoId,
            videoUrl: nextVideo.videoUrl,
            videoTitle: nextVideo.title,
            streamUrl: nextVideo.videoType === 'twitch' || nextVideo.videoType === 'kick' ? nextVideo.videoUrl : undefined,
            streamPlatform: nextVideo.streamPlatform || (nextVideo.videoType === 'twitch' || nextVideo.videoType === 'kick' ? nextVideo.videoType : undefined),
            streamDelaySec,
            status: 'parlay',
          },
        });
        
        await prisma.room.update({
          where: { id: room.id },
          data: { status: 'parlay' },
        });
        
        await prisma.videoQueue.delete({ where: { id: nextVideo.id } });
        
        const remaining = await prisma.videoQueue.findMany({
          where: { roomId: room.id },
          orderBy: { order: 'asc' },
        });
        
        console.log(`🎬 Starting new round ${newIndex} with video: ${nextVideo.title}`);
        
        io.to(`room:${roomCode}`).emit('round:started', { round });
        io.to(`room:${roomCode}`).emit('round:status', { status: 'parlay' });
        io.to(`room:${roomCode}`).emit('queue:updated', { videos: remaining });
      } catch (error) {
        console.error('Error starting from queue:', error);
        socket.emit('error', { message: 'Failed to start round' });
      }
    });

    socket.on('host:endRound', async () => {
      try {
        const { roomCode, playerId } = data;
        if (!roomCode || !playerId) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room || room.hostId !== playerId) return;
        
        const round = await prisma.round.findFirst({
          where: { roomId: room.id },
          orderBy: { index: 'desc' },
        });
        if (!round) return;
        
        // Check if there are more videos in queue
        const nextVideo = await prisma.videoQueue.findFirst({
          where: { roomId: room.id },
          orderBy: { order: 'asc' },
        });
        
        if (nextVideo) {
          // Auto-start next video with new parlays
          console.log('🎬 Auto-advancing to next video');
          
          // Reset parlays for new round
          await prisma.parlay.updateMany({
            where: { roundId: round.id },
            data: { isUsed: false },
          });
          
          const newRound = await prisma.round.create({
            data: {
              roomId: room.id,
              index: round.index + 1,
              videoType: nextVideo.videoType,
              videoId: nextVideo.videoId,
              videoUrl: nextVideo.videoUrl,
              videoTitle: nextVideo.title,
              status: 'parlay',
            },
          });
          
          await prisma.room.update({
            where: { id: room.id },
            data: { status: 'parlay' },
          });
          
          await prisma.videoQueue.delete({ where: { id: nextVideo.id } });
          
          const remaining = await prisma.videoQueue.findMany({
            where: { roomId: room.id },
            orderBy: { order: 'asc' },
          });
          
          io.to(`room:${roomCode}`).emit('round:started', { round: newRound });
          io.to(`room:${roomCode}`).emit('round:status', { status: 'parlay' });
          io.to(`room:${roomCode}`).emit('queue:updated', { videos: remaining });
        } else {
          // No more videos - end game with final scores
          const finalScores = await prisma.player.findMany({
            where: { roomId: room.id },
            orderBy: { scoreTotal: 'desc' },
            select: {
              id: true,
              name: true,
              scoreTotal: true,
            },
          });
          
          await prisma.room.update({
            where: { id: room.id },
            data: { status: 'results' },
          });
          
          console.log('🏆 Game Over! Final scores:', finalScores);
          
          io.to(`room:${roomCode}`).emit('round:status', { status: 'results' });
          io.to(`room:${roomCode}`).emit('game:over', { 
            finalScores,
            winner: finalScores[0] || null 
          });
        }
      } catch (error) {
        console.error('Error ending round:', error);
        socket.emit('error', { message: 'Failed to end round' });
      }
    });

    socket.on('player:requestParlays', async () => {
      try {
        const { roomCode } = data;
        if (!roomCode) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room) return;
        
        const round = await prisma.round.findFirst({
          where: { roomId: room.id, status: 'video' },
          orderBy: { index: 'desc' },
        });
        
        if (!round) return;
        
        const allParlays = await prisma.parlay.findMany({
          where: { roundId: round.id, isUsed: false },
        });
        
        const parlaysToSend = allParlays.map(p => ({
          id: p.id,
          text: p.text,
          normalizedText: p.normalizedText,
          playerId: p.playerId,
        }));
        
        console.log(`Sending ${parlaysToSend.length} parlays to ${socket.id}`);
        socket.emit('parlay:all', { parlays: parlaysToSend });
      } catch (error) {
        console.error('Error fetching parlays:', error);
      }
    });

    socket.on('ping', (callback) => {
      callback(Date.now());
    });

    // Host video sync event
    socket.on('host:sync', ({ tVideoSec }) => {
      const { roomCode, playerId } = data;
      if (!roomCode) return;
      
      io.to(`room:${roomCode}`).emit('host:sync', { tVideoSec });
    });

    // Handle host video control commands
    socket.on('host:play', async () => {
      const { roomCode, playerId } = data;
      if (!roomCode || !playerId) return;
      
      // Verify this is the host
      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room || room.hostId !== playerId) return;
      
      console.log(`🎬 Host playing video in room ${roomCode}`);
      io.to(`room:${roomCode}`).emit('video:play');
    });

    socket.on('host:pause', async () => {
      const { roomCode, playerId } = data;
      if (!roomCode || !playerId) return;
      
      // Verify this is the host
      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room || room.hostId !== playerId) return;
      
      console.log(`⏸️ Host pausing video in room ${roomCode}`);
      io.to(`room:${roomCode}`).emit('video:pause');
    });

    socket.on('host:seek', async ({ tVideoSec }) => {
      const { roomCode, playerId } = data;
      if (!roomCode || !playerId) return;
      
      // Verify this is the host
      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room || room.hostId !== playerId) return;
      
      console.log(`⏩ Host seeking to ${tVideoSec}s in room ${roomCode}`);
      io.to(`room:${roomCode}`).emit('video:seek', { tVideoSec });
    });

    // Game Mode Handler
    socket.on('host:setGameMode', async ({ gameMode }) => {
      const { roomCode, playerId } = data;
      if (!roomCode || !playerId) return;
      
      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room || room.hostId !== playerId) return;
      
      // Update room settings with game mode
      const currentSettings = room.settings as any as RoomSettings;
      await prisma.room.update({
        where: { id: room.id },
        data: {
          settings: {
            ...currentSettings,
            gameMode: gameMode || 'classic'
          }
        }
      });
      
      console.log(`🎮 Game mode set to ${gameMode} for room ${roomCode}`);
      io.to(`room:${roomCode}`).emit('gameMode:changed', { gameMode });
    });

    // Speed Mode Handlers
    socket.on('speed:startRound', async ({ roundNumber }) => {
      const { roomCode, playerId } = data;
      if (!roomCode || !playerId) return;
      
      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room || room.hostId !== playerId) return;
      
      console.log(`⚡ Starting speed round ${roundNumber} in room ${roomCode}`);
      
      // Update room status to speed mode
      await prisma.room.update({
        where: { id: room.id },
        data: { status: 'video' } // Use video status for speed mode
      });
      
      // Initialize speed round
      io.to(`room:${roomCode}`).emit('speed:roundStarted', { 
        roundNumber,
        parlayTime: 10,
        videoTime: 30,
        resultsTime: 5
      });
    });

    socket.on('speed:submitParlay', async ({ parlays, submissionTime }) => {
      const { roomCode, playerId } = data;
      if (!roomCode || !playerId) return;
      
      // Record submission time for speed bonus
      speedScoring.recordSubmission(playerId, submissionTime, true);
      
      // Broadcast to room
      io.to(`room:${roomCode}`).emit('speed:parlaySubmitted', { 
        playerId,
        submissionTime
      });
      
      console.log(`⚡ Speed parlay submitted by ${playerId} in ${submissionTime}s`);
    });

    socket.on('speed:startVideo', async () => {
      const { roomCode, playerId } = data;
      if (!roomCode || !playerId) return;
      
      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room || room.hostId !== playerId) return;
      
      io.to(`room:${roomCode}`).emit('speed:phaseChange', { 
        phase: 'video',
        timeRemaining: 30
      });
    });

    socket.on('speed:showResults', async () => {
      const { roomCode, playerId } = data;
      if (!roomCode || !playerId) return;
      
      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room || room.hostId !== playerId) return;
      
      // Calculate scores for this round
      const players = await prisma.player.findMany({ where: { roomId: room.id } });
      const scores = players.filter(p => !p.isHost).map(player => {
        const stats = speedScoring.getStats(player.id);
        return {
          playerId: player.id,
          speedBonus: stats.speedBonusEarned,
          combo: stats.currentCombo,
          averageSpeed: stats.averageSpeed
        };
      });
      
      io.to(`room:${roomCode}`).emit('speed:phaseChange', { 
        phase: 'results',
        timeRemaining: 5,
        scores
      });
    });

    socket.on('speed:getStats', async () => {
      const { playerId } = data;
      if (!playerId) return;
      
      const stats = speedScoring.getStats(playerId);
      socket.emit('speed:stats', stats);
    });

    // Team Mode Handlers
    socket.on('teams:assign', async ({ teams }) => {
      const { roomCode, playerId } = data;
      if (!roomCode || !playerId) return;
      
      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room || room.hostId !== playerId) return;
      
      teamManager.initializeTeams(room.id, teams);
      io.to(`room:${roomCode}`).emit('teams:updated', { teams });
      
      console.log(`👥 Teams assigned in room ${roomCode}`, teams.map((t: any) => ({ name: t.name, players: t.players.length })));
    });

    socket.on('teams:confirm', async ({ teams }) => {
      const { roomCode, playerId } = data;
      if (!roomCode || !playerId) return;
      
      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room || room.hostId !== playerId) return;
      
      // Join team-specific rooms for chat
      teams.forEach((team: any) => {
        team.players.forEach((player: any) => {
          const playerSocket = io.sockets.sockets.get(player.id);
          if (playerSocket) {
            playerSocket.join(`team:${roomCode}:${team.id}`);
          }
        });
      });
      
      io.to(`room:${roomCode}`).emit('teams:ready', { teams });
      console.log(`👥 Teams confirmed and ready in room ${roomCode}`);
    });

    socket.on('team:sendMessage', async ({ teamId, message }) => {
      const { roomCode, playerId } = data;
      if (!roomCode || !playerId || !teamId) return;
      
      const team = teamManager.getPlayerTeam(playerId);
      if (!team || team.id !== teamId) return;
      
      teamManager.addTeamMessage(roomCode, teamId, message);
      io.to(`team:${roomCode}:${teamId}`).emit('team:message', { message });
      
      console.log(`💬 Team message in ${team.name}: ${message.playerName}: ${message.message}`);
    });

    socket.on('team:typing', async ({ teamId, playerId: typingPlayerId, playerName }) => {
      const { roomCode } = data;
      if (!roomCode || !teamId) return;
      
      socket.to(`team:${roomCode}:${teamId}`).emit('team:typing', { playerId: typingPlayerId, playerName });
    });

    socket.on('team:getScores', async () => {
      const { roomCode } = data;
      if (!roomCode) return;
      
      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room) return;
      
      const scores = teamManager.getTeamScores(room.id);
      socket.emit('team:scores', { scores });
    });

    // Update scoring to include team scores
    socket.on('score:update', async ({ playerId: scoredPlayerId, points, reason }) => {
      const { roomCode } = data;
      if (!roomCode) return;
      
      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room) return;
      
      const settings = room.settings as any;
      if (settings.gameMode === 'team') {
        // Add to team score
        const teamScore = teamManager.addTeamScore(scoredPlayerId, points);
        if (teamScore) {
          io.to(`room:${roomCode}`).emit('team:scoreUpdate', { teamScore });
        }
      }
    });

    // Power-Up Handlers
    socket.on('powerups:getInventory', () => {
      const { playerId } = data;
      if (!playerId) return;
      
      const inventory = powerUpManager.getInventory(playerId);
      socket.emit('powerups:inventory', { inventory });
    });

    socket.on('powerups:getActiveEffects', () => {
      const { playerId } = data;
      if (!playerId) return;
      
      const effects = powerUpManager.getActiveEffects(playerId);
      socket.emit('powerups:activeEffects', { effects });
    });

    socket.on('powerups:getCooldowns', () => {
      const { playerId } = data;
      if (!playerId) return;
      
      const cooldowns = powerUpManager.getCooldowns(playerId);
      const cooldownObj: Record<string, number> = {};
      cooldowns.forEach((time, type) => {
        cooldownObj[type] = time;
      });
      socket.emit('powerups:cooldowns', { cooldowns: cooldownObj });
    });

    socket.on('powerups:purchase', async ({ type }) => {
      const { playerId } = data;
      if (!playerId) return;
      
      const player = await prisma.player.findUnique({ where: { id: playerId } });
      if (!player) return;
      
      const result = await powerUpManager.purchasePowerUp(playerId, type as PowerUpType, player.scoreTotal);
      
      if (result.success) {
        const updatedPlayer = await prisma.player.findUnique({ where: { id: playerId } });
        socket.emit('powerups:purchased', { 
          powerUp: powerUpManager.getInventory(playerId).find(p => p.powerUp.type === type),
          newScore: updatedPlayer?.scoreTotal || 0
        });
      } else {
        socket.emit('powerups:error', { message: result.message });
      }
    });

    socket.on('powerups:use', async ({ type, targetPlayerId }) => {
      const { playerId, roomCode } = data;
      if (!playerId || !roomCode) return;
      
      const result = await powerUpManager.usePowerUp(playerId, type as PowerUpType, targetPlayerId);
      
      if (result.success) {
        socket.emit('powerups:used', { type, message: result.message });
        
        // Handle specific power-up effects
        switch (type) {
          case PowerUpType.STEAL_POINTS:
            if (targetPlayerId) {
              const stealResult = await powerUpManager.executeStealPoints(playerId, targetPlayerId, prisma);
              io.to(`room:${roomCode}`).emit('powerup:stealPoints', {
                sourcePlayerId: playerId,
                targetPlayerId,
                amount: stealResult.stolenPoints
              });
            }
            break;
            
          case PowerUpType.REVEAL_HINT:
            // Get a random parlay from current round
            const room = await prisma.room.findUnique({ where: { code: roomCode } });
            const round = await prisma.round.findFirst({
              where: { roomId: room!.id, status: 'video' },
              orderBy: { index: 'desc' },
              include: { parlays: true }
            });
            
            if (round && round.parlays.length > 0) {
              const randomParlay = round.parlays[Math.floor(Math.random() * round.parlays.length)];
              socket.emit('powerup:revealHint', { 
                hint: randomParlay.text.substring(0, Math.min(15, randomParlay.text.length)) + '...'
              });
            }
            break;
            
          case PowerUpType.COMBO_BREAKER:
            if (targetPlayerId) {
              // Reset combo in speed mode
              speedScoring.recordSubmission(targetPlayerId, 0, false);
              io.to(`room:${roomCode}`).emit('powerup:comboBreak', {
                targetPlayerId,
                breakerPlayerId: playerId
              });
            }
            break;
        }
        
        // Broadcast effect to room
        io.to(`room:${roomCode}`).emit('powerup:activated', {
          playerId,
          type,
          effect: result.effect
        });
      } else {
        socket.emit('powerups:error', { message: result.message });
      }
    });

    socket.on('powerups:getPlayers', async () => {
      const { roomCode, playerId } = data;
      if (!roomCode || !playerId) return;
      
      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room) return;
      
      const players = await prisma.player.findMany({
        where: { 
          roomId: room.id,
          id: { not: playerId },
          isHost: false
        },
        orderBy: { scoreTotal: 'desc' }
      });
      
      socket.emit('powerups:playersList', { players });
    });
    
    // Set up WebRTC handlers for low-latency peer connections
    setupWebRTCHandlers(io, socket);
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Clean up player from team if in team mode
      if (data.roomCode && data.playerId) {
        const playerTeam = teamManager.getPlayerTeam(data.playerId);
        if (playerTeam) {
          socket.to(`team:${data.roomCode}:${playerTeam.id}`).emit('team:playerLeft', { 
            playerName: playerTeam.players.find(p => p.id === data.playerId)?.name || 'Player' 
          });
        }
      }
    });
  });
}