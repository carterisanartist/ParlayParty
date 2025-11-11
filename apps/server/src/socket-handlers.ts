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
        
        const existingPlayers = await prisma.player.count({ where: { roomId: room.id } });
        const isHost = existingPlayers === 0;
        
        const player = await prisma.player.create({
          data: {
            roomId: room.id,
            name,
            avatarUrl,
            isHost,
          },
        });
        
        if (isHost) {
          await prisma.room.update({
            where: { id: room.id },
            data: { hostId: player.id },
          });
          room.hostId = player.id;
        }
        
        data.playerId = player.id;
        socket.join(`room:${roomCode}`);
        
        const currentRound = await prisma.round.findFirst({
          where: { roomId: room.id },
          orderBy: { index: 'desc' },
        });
        
        io.to(`room:${roomCode}`).emit('player:joined', { player });
        
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

    // Keep all other handlers unchanged...
    socket.on('ping', (callback) => {
      callback(Date.now());
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}