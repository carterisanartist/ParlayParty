import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
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

const prisma = new PrismaClient();

interface SocketData {
  roomCode?: string;
  playerId?: string;
}

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);
    
    const data = socket.data as SocketData;
    
    socket.on('player:join', async ({ name, avatarUrl }, callback) => {
      try {
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
          console.log('🔄 Player reconnecting:', name, 'Room status:', room.status);
          // Update existing player
          player = await prisma.player.update({
            where: { id: player.id },
            data: { avatarUrl },
          });
        } else {
          console.log('✨ New player joining:', name);
          const existingPlayers = await prisma.player.count({ where: { roomId: room.id } });
          const isHost = existingPlayers === 0;
          
          // Create new player
          player = await prisma.player.create({
            data: {
              roomId: room.id,
              name,
              avatarUrl,
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
        }
        
        const allPlayers = await prisma.player.findMany({ where: { roomId: room.id } });
        io.to(`room:${roomCode}`).emit('roster:update', { players: allPlayers });
        
        callback({ player, room, round: currentRound || undefined });
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Vote handler - SIMPLIFIED AND WORKING
    socket.on('vote:add', async ({ tVideoSec, normalizedText, parlayText }) => {
      try {
        console.log('🎯 VOTE:ADD received from player:', data.playerId, { tVideoSec, normalizedText, parlayText });
        
        const { roomCode, playerId } = data;
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
        
        // Get all players to check if solo
        const allPlayers = await prisma.player.findMany({ where: { roomId: room!.id } });
        const otherPlayers = allPlayers.filter(p => p.id !== playerId);
        
        console.log(`🎮 Room has ${allPlayers.length} players, ${otherPlayers.length} others`);
        
        // Award point immediately and pause video
        await prisma.player.update({
          where: { id: playerId },
          data: { scoreTotal: { increment: 1 } },
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
          console.log('✅ Marked parlay as used (once only)');
        }
        
        const caller = await prisma.player.findUnique({ where: { id: playerId } });
        
        console.log('✅ Awarding point and broadcasting pause');
        
        // Broadcast pause immediately  
        io.to(`room:${roomCode}`).emit('event:confirmed', { event: { normalizedText } });
        io.to(`room:${roomCode}`).emit('video:pause_auto', {
          tCenter: tVideoSec,
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
        console.error('💥 Error in vote:add:', error);
        socket.emit('error', { message: 'Failed to add vote' });
      }
    });

    socket.on('queue:add', async ({ videoType, videoUrl, videoId, title }) => {
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
        
        const round = await prisma.round.create({
          data: {
            roomId: room.id,
            index: newIndex,
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
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}