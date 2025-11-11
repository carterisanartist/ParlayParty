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

    socket.on('queue:reorder', async ({ videoId, newOrder }) => {
      try {
        const { roomCode, playerId } = data;
        if (!roomCode || !playerId) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room) return;
        
        const video = await prisma.videoQueue.findUnique({ where: { id: videoId } });
        if (!video || video.roomId !== room.id) return;
        
        const allVideos = await prisma.videoQueue.findMany({
          where: { roomId: room.id },
          orderBy: { order: 'asc' },
        });
        
        const oldOrder = video.order;
        const updatedVideos = allVideos.map(v => {
          if (v.id === videoId) {
            return { ...v, order: newOrder };
          }
          if (oldOrder < newOrder) {
            if (v.order > oldOrder && v.order <= newOrder) {
              return { ...v, order: v.order - 1 };
            }
          } else {
            if (v.order >= newOrder && v.order < oldOrder) {
              return { ...v, order: v.order + 1 };
            }
          }
          return v;
        });
        
        for (const v of updatedVideos) {
          await prisma.videoQueue.update({
            where: { id: v.id },
            data: { order: v.order },
          });
        }
        
        const finalVideos = await prisma.videoQueue.findMany({
          where: { roomId: room.id },
          orderBy: { order: 'asc' },
        });
        
        io.to(`room:${roomCode}`).emit('queue:updated', { videos: finalVideos });
      } catch (error) {
        console.error('Error reordering queue:', error);
      }
    });

    socket.on('queue:remove', async ({ videoId }) => {
      try {
        const { roomCode, playerId } = data;
        if (!roomCode || !playerId) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room) return;
        
        await prisma.videoQueue.delete({ where: { id: videoId } });
        
        const remaining = await prisma.videoQueue.findMany({
          where: { roomId: room.id },
          orderBy: { order: 'asc' },
        });
        
        for (let i = 0; i < remaining.length; i++) {
          await prisma.videoQueue.update({
            where: { id: remaining[i].id },
            data: { order: i },
          });
        }
        
        const allVideos = await prisma.videoQueue.findMany({
          where: { roomId: room.id },
          orderBy: { order: 'asc' },
        });
        
        io.to(`room:${roomCode}`).emit('queue:updated', { videos: allVideos });
      } catch (error) {
        console.error('Error removing from queue:', error);
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
        
        io.to(`room:${roomCode}`).emit('round:started', { round });
        io.to(`room:${roomCode}`).emit('round:status', { status: 'parlay' });
        io.to(`room:${roomCode}`).emit('queue:updated', { videos: remaining });
      } catch (error) {
        console.error('Error starting from queue:', error);
        socket.emit('error', { message: 'Failed to start round' });
      }
    });

    socket.on('host:startRound', async ({ videoType, videoUrl, videoId }) => {
      try {
        const { roomCode, playerId } = data;
        if (!roomCode || !playerId) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room || room.hostId !== playerId) return;
        
        const lastRound = await prisma.round.findFirst({
          where: { roomId: room.id },
          orderBy: { index: 'desc' },
        });
        
        const newIndex = (lastRound?.index || 0) + 1;
        
        const round = await prisma.round.create({
          data: {
            roomId: room.id,
            index: newIndex,
            videoType,
            videoId,
            videoUrl,
            status: 'parlay',
          },
        });
        
        await prisma.room.update({
          where: { id: room.id },
          data: { status: 'parlay' },
        });
        
        io.to(`room:${roomCode}`).emit('round:started', { round });
        io.to(`room:${roomCode}`).emit('round:status', { status: 'parlay' });
      } catch (error) {
        console.error('Error starting round:', error);
        socket.emit('error', { message: 'Failed to start round' });
      }
    });
    
    socket.on('parlay:submit', async ({ text, punishment }) => {
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
            data: { text, normalizedText: normalized, punishment },
          });
        } else {
          await prisma.parlay.create({
            data: {
              roundId: round.id,
              playerId,
              text,
              normalizedText: normalized,
              punishment,
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
    
    socket.on('vote:add', async ({ tVideoSec, normalizedText, parlayText }) => {
      try {
        const { roomCode, playerId } = data;
        if (!roomCode || !playerId) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room) return;
        
        const round = await prisma.round.findFirst({
          where: { roomId: room.id, status: 'video' },
          orderBy: { index: 'desc' },
        });
        if (!round) return;
        
        const recentVote = await prisma.vote.findFirst({
          where: { roundId: round.id, playerId },
          orderBy: { createdAt: 'desc' },
        });
        
        if (recentVote) {
          const timeSinceLastVote = Date.now() - recentVote.createdAt.getTime();
          if (timeSinceLastVote < 2000) return;
        }
        
        const player = await prisma.player.findUnique({ where: { id: playerId } });
        const correctedTime = tVideoSec - (player?.latencyMs || 0) / 2000;
        
        const vote = await prisma.vote.create({
          data: {
            roundId: round.id,
            playerId,
            normalizedText,
            tVideoSec: correctedTime,
          },
        });
        
        // Get parlay with punishment
        const parlay = await prisma.parlay.findFirst({
          where: { roundId: round.id, normalizedText },
          include: { player: true },
        });
        
        const caller = await prisma.player.findUnique({ where: { id: playerId } });
        const allPlayers = await prisma.player.findMany({ where: { roomId: room.id } });
        const otherPlayers = allPlayers.filter(p => p.id !== playerId);
        
        console.log(`Vote by ${caller?.name}, sending verification to ${otherPlayers.length} players`);
        
        // Broadcast verification with punishment info
        io.to(`room:${roomCode}`).except(socket.id).emit('vote:verify', {
          callerId: playerId,
          callerName: caller?.name || 'Someone',
          parlayText: parlayText || normalizedText,
          punishment: parlay?.punishment,
          voteId: vote.id,
        });
        
        console.log('Verification broadcasted');
      } catch (error) {
        console.error('Error adding vote:', error);
        socket.emit('error', { message: 'Failed to add vote' });
      }
    });
    
    socket.on('vote:respond', async ({ voteId, agree }) => {
      try {
        const { roomCode, playerId } = data;
        if (!roomCode || !playerId) return;
        
        // Store response in Redis temporarily
        const key = `vote:${voteId}:responses`;
        await redis.hset(key, playerId, agree ? 'true' : 'false');
        await redis.expire(key, 60); // Expire after 1 minute
        
        // Get all responses
        const responses = await redis.hgetall(key);
        const trueCount = Object.values(responses).filter(v => v === 'true').length;
        const falseCount = Object.values(responses).filter(v => v === 'false').length;
        const totalResponses = trueCount + falseCount;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room) return;
        
        const allPlayers = await prisma.player.findMany({ where: { roomId: room.id } });
        const otherPlayersCount = allPlayers.length - 1; // Exclude caller
        
        console.log(`Verification responses: ${totalResponses}/${otherPlayersCount} (TRUE: ${trueCount}, FALSE: ${falseCount})`);
        
        // Check if we have all responses or majority (or if solo player after 1 second)
        const isSolo = otherPlayersCount === 0;
        const hasEnoughVotes = totalResponses >= otherPlayersCount || totalResponses >= Math.ceil(otherPlayersCount / 2);
        
        if (hasEnoughVotes || isSolo) {
          const vote = await prisma.vote.findUnique({ where: { id: voteId } });
          if (!vote) return;
          
          // Solo player always gets approved
          const majority = isSolo ? true : trueCount > falseCount;
          
          if (majority) {
            // Award simple +1 point
            await prisma.player.update({
              where: { id: vote.playerId },
              data: {
                scoreTotal: {
                  increment: 1,
                },
              },
            });
            
            // Update parlay
            const parlayToUpdate = await prisma.parlay.findFirst({
              where: { roundId: vote.roundId, playerId: vote.playerId },
            });
            
            if (parlayToUpdate) {
              await prisma.parlay.update({
                where: { id: parlayToUpdate.id },
                data: {
                  scoreFinal: { increment: 1 },
                  legsHit: { increment: 1 },
                },
              });
            }
            
            // Create confirmed event
            await prisma.confirmedEvent.create({
              data: {
                roundId: vote.roundId,
                normalizedText: vote.normalizedText,
                tVideoSec: vote.tVideoSec,
                source: 'consensus',
                awardedTo: [vote.playerId],
              },
            });
            
            // Get parlay WITH player info for display
            const parlayWithPlayer = await prisma.parlay.findFirst({
              where: { roundId: vote.roundId, normalizedText: vote.normalizedText },
              include: { player: true },
            });
            
            const caller = await prisma.player.findUnique({ where: { id: vote.playerId } });
            
            // Broadcast success with punishment info
            io.to(`room:${roomCode}`).emit('event:confirmed', { event: { normalizedText: vote.normalizedText } });
            io.to(`room:${roomCode}`).emit('video:pause_auto', {
              tCenter: vote.tVideoSec,
              normalizedText: vote.normalizedText,
              voters: [vote.playerId],
              punishment: parlayWithPlayer?.punishment,
              callerName: caller?.name,
              writerName: parlayWithPlayer?.player?.name,
            });
            
            const settings = room.settings as any as RoomSettings;
            const pauseDuration = (settings.pauseDurationSec || 20) * 1000;
            
            setTimeout(() => {
              io.to(`room:${roomCode}`).emit('video:resume');
            }, pauseDuration);
            
          } else {
            // Majority said FALSE - small penalty
            await prisma.player.update({
              where: { id: vote.playerId },
              data: {
                scoreTotal: {
                  decrement: 0.5,
                },
              },
            });
            
            console.log(`Event rejected by majority`);
          }
          
          // Clean up
          await redis.del(key);
        }
      } catch (error) {
        console.error('Error processing verification:', error);
      }
    });

    socket.on('host:confirmEvent', async ({ tCenter, normalizedText }) => {
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
        
        const matchingParlays = await prisma.parlay.findMany({
          where: { roundId: round.id, normalizedText },
        });
        
        const roomSettings = room.settings as any as RoomSettings;
        const awardedPlayerIds: string[] = [];
        const scoreUpdates: any[] = [];
        
        const allVotes = await prisma.vote.findMany({
          where: {
            roundId: round.id,
            normalizedText,
            tVideoSec: {
              gte: tCenter - roomSettings.voteWindowSec,
              lte: tCenter + roomSettings.voteWindowSec,
            },
          },
        });
        
        const voteTimes = allVotes.map(v => v.tVideoSec);
        const medianTime = voteTimes.sort((a, b) => a - b)[Math.floor(voteTimes.length / 2)] || tCenter;
        
        for (const parlay of matchingParlays) {
          const playerVote = allVotes.find(v => v.playerId === parlay.playerId);
          const fastTap = playerVote ? Math.abs(playerVote.tVideoSec - medianTime) <= roomSettings.fastTapWindow : false;
          
          const scoreCalc = await calculateEventScore(
            round.id,
            normalizedText,
            parlay.playerId,
            roomSettings.scoreMultiplier,
            fastTap
          );
          
          const newScoreFinal = parlay.scoreFinal + scoreCalc.totalScore;
          const newLegsHit = parlay.legsHit + 1;
          
          await prisma.parlay.update({
            where: { id: parlay.id },
            data: {
              scoreFinal: newScoreFinal,
              legsHit: newLegsHit,
              completedAt: new Date(),
            },
          });
          
          await prisma.player.update({
            where: { id: parlay.playerId },
            data: {
              scoreTotal: {
                increment: scoreCalc.totalScore,
              },
            },
          });
          
          awardedPlayerIds.push(parlay.playerId);
          scoreUpdates.push({
            playerId: parlay.playerId,
            parlayId: parlay.id,
            delta: scoreCalc.totalScore,
            newTotal: 0,
            reason: 'event_confirmed',
          });
        }
        
        const event = await prisma.confirmedEvent.create({
          data: {
            roundId: round.id,
            normalizedText,
            tVideoSec: tCenter,
            source: 'consensus',
            awardedTo: awardedPlayerIds,
          },
        });
        
        const updatedPlayers = await prisma.player.findMany({ where: { roomId: room.id } });
        for (const update of scoreUpdates) {
          const player = updatedPlayers.find(p => p.id === update.playerId);
          if (player) update.newTotal = player.scoreTotal;
        }
        
        io.to(`room:${roomCode}`).emit('event:confirmed', { event });
        io.to(`room:${roomCode}`).emit('scoreboard:update', { scores: scoreUpdates });
        
        const pauseDuration = (roomSettings.pauseDurationSec || 20) * 1000;
        
        setTimeout(() => {
          io.to(`room:${roomCode}`).emit('video:resume');
        }, pauseDuration);
      } catch (error) {
        console.error('Error confirming event:', error);
        socket.emit('error', { message: 'Failed to confirm event' });
      }
    });
    
    socket.on('host:dismissEvent', async ({ tCenter, normalizedText }) => {
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
        
        // Find votes for this dismissed event
        const dismissedVotes = await prisma.vote.findMany({
          where: {
            roundId: round.id,
            normalizedText,
            tVideoSec: {
              gte: tCenter - 2.5,
              lte: tCenter + 2.5,
            },
          },
        });
        
        // Apply -0.5 penalty to each voter
        const penalizedPlayerIds = new Set(dismissedVotes.map(v => v.playerId));
        const scoreUpdates: any[] = [];
        
        for (const voterId of penalizedPlayerIds) {
          await prisma.player.update({
            where: { id: voterId },
            data: {
              scoreTotal: {
                decrement: 0.5,
              },
            },
          });
          
          const player = await prisma.player.findUnique({ where: { id: voterId } });
          scoreUpdates.push({
            playerId: voterId,
            parlayId: null,
            delta: -0.5,
            newTotal: player?.scoreTotal || 0,
            reason: 'false_call_penalty',
          });
        }
        
        io.to(`room:${roomCode}`).emit('scoreboard:update', { scores: scoreUpdates });
        io.to(`room:${roomCode}`).emit('video:resume');
      } catch (error) {
        console.error('Error dismissing event:', error);
        socket.emit('error', { message: 'Failed to dismiss event' });
      }
    });

    socket.on('host:play', async () => {
      try {
        const { roomCode, playerId } = data;
        if (!roomCode || !playerId) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room || room.hostId !== playerId) return;
        
        io.to(`room:${roomCode}`).emit('video:play');
      } catch (error) {
        console.error('Error playing video:', error);
      }
    });
    
    socket.on('host:pause', async () => {
      try {
        const { roomCode, playerId } = data;
        if (!roomCode || !playerId) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room || room.hostId !== playerId) return;
        
        io.to(`room:${roomCode}`).emit('video:pause');
      } catch (error) {
        console.error('Error pausing video:', error);
      }
    });
    
    socket.on('host:seek', async ({ tVideoSec }) => {
      try {
        const { roomCode, playerId } = data;
        if (!roomCode || !playerId) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room || room.hostId !== playerId) return;
        
        io.to(`room:${roomCode}`).emit('video:seek', { tVideoSec });
      } catch (error) {
        console.error('Error seeking video:', error);
      }
    });

    socket.on('host:sync', async ({ tVideoSec }) => {
      const { roomCode } = data;
      if (!roomCode) return;
      // Broadcast current video time to all players for sync
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
        
        // Check if there are unreviewed markers
        const markers = await prisma.marker.findMany({
          where: { roundId: round.id },
        });
        
        // Update round status
        await prisma.round.update({
          where: { id: round.id },
          data: { status: markers.length > 0 ? 'review' : 'wheel' },
        });
        
        // Update room status
        await prisma.room.update({
          where: { id: room.id },
          data: { status: markers.length > 0 ? 'review' : 'wheel' },
        });
        
        io.to(`room:${roomCode}`).emit('round:status', { 
          status: markers.length > 0 ? 'review' : 'wheel' 
        });
        
        if (markers.length > 0) {
          io.to(`room:${roomCode}`).emit('review:markers', { markers });
        }
      } catch (error) {
        console.error('Error ending round:', error);
        socket.emit('error', { message: 'Failed to end round' });
      }
    });

    socket.on('review:list', async (callback) => {
      try {
        const { roomCode, playerId } = data;
        if (!roomCode || !playerId) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room || room.hostId !== playerId) return;
        
        const round = await prisma.round.findFirst({
          where: { roomId: room.id },
          orderBy: { index: 'desc' },
        });
        if (!round) return callback({ markers: [] });
        
        const markers = await prisma.marker.findMany({
          where: { roundId: round.id },
          orderBy: { tVideoSec: 'asc' },
        });
        
        callback({ markers });
      } catch (error) {
        console.error('Error fetching markers:', error);
        callback({ markers: [] });
      }
    });

    socket.on('review:confirm', async ({ markerId, tVideoSec, normalizedText }) => {
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
        
        const matchingParlays = await prisma.parlay.findMany({
          where: { roundId: round.id, normalizedText },
        });
        
        const settings = room.settings as any as RoomSettings;
        const awardedPlayerIds: string[] = [];
        const scoreUpdates: any[] = [];
        
        for (const parlay of matchingParlays) {
          const scoreCalc = await calculateEventScore(
            round.id,
            normalizedText,
            parlay.playerId,
            settings.scoreMultiplier,
            false
          );
          
          const newScoreFinal = parlay.scoreFinal + scoreCalc.totalScore;
          const newLegsHit = parlay.legsHit + 1;
          
          await prisma.parlay.update({
            where: { id: parlay.id },
            data: {
              scoreFinal: newScoreFinal,
              legsHit: newLegsHit,
              completedAt: new Date(),
            },
          });
          
          await prisma.player.update({
            where: { id: parlay.playerId },
            data: {
              scoreTotal: {
                increment: scoreCalc.totalScore,
              },
            },
          });
          
          awardedPlayerIds.push(parlay.playerId);
          scoreUpdates.push({
            playerId: parlay.playerId,
            parlayId: parlay.id,
            delta: scoreCalc.totalScore,
            newTotal: 0,
            reason: 'review_confirmed',
          });
        }
        
        const event = await prisma.confirmedEvent.create({
          data: {
            roundId: round.id,
            normalizedText,
            tVideoSec: tVideoSec || 0,
            source: 'host_review',
            awardedTo: awardedPlayerIds,
          },
        });
        
        const updatedPlayers = await prisma.player.findMany({ where: { roomId: room.id } });
        for (const update of scoreUpdates) {
          const player = updatedPlayers.find(p => p.id === update.playerId);
          if (player) update.newTotal = player.scoreTotal;
        }
        
        if (markerId) {
          await prisma.marker.delete({ where: { id: markerId } });
        }
        
        io.to(`room:${roomCode}`).emit('event:confirmed', { event });
        io.to(`room:${roomCode}`).emit('scoreboard:update', { scores: scoreUpdates });
      } catch (error) {
        console.error('Error confirming review:', error);
        socket.emit('error', { message: 'Failed to confirm review' });
      }
    });

    socket.on('host:mark', async ({ tVideoSec, note }) => {
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
        
        const marker = await prisma.marker.create({
          data: {
            roundId: round.id,
            hostId: playerId,
            tVideoSec,
            note,
          },
        });
        
        io.to(`room:${roomCode}`).emit('marker:added', { marker });
      } catch (error) {
        console.error('Error adding marker:', error);
        socket.emit('error', { message: 'Failed to add marker' });
      }
    });
    
    socket.on('wheel:submit', async ({ text }) => {
      try {
        const { roomCode, playerId } = data;
        if (!roomCode || !playerId) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room) return;
        
        const round = await prisma.round.findFirst({
          where: { roomId: room.id },
          orderBy: { index: 'desc' },
        });
        if (!round) return;
        
        const entry = await prisma.wheelEntry.create({
          data: {
            roundId: round.id,
            submittedByPlayerId: playerId,
            text,
            status: 'pending',
            weight: 1.0,
          },
        });
        
        io.to(`room:${roomCode}`).emit('wheel:entry_added', { entry });
      } catch (error) {
        console.error('Error submitting wheel entry:', error);
        socket.emit('error', { message: 'Failed to submit punishment' });
      }
    });
    
    socket.on('wheel:moderate', async ({ entryId, status }) => {
      try {
        const { roomCode, playerId } = data;
        if (!roomCode || !playerId) return;
        
        const room = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!room || room.hostId !== playerId) return;
        
        await prisma.wheelEntry.update({
          where: { id: entryId },
          data: { status },
        });
        
        io.to(`room:${roomCode}`).emit('wheel:entry_moderated', { entryId, status });
      } catch (error) {
        console.error('Error moderating wheel entry:', error);
        socket.emit('error', { message: 'Failed to moderate entry' });
      }
    });
    
    socket.on('wheel:spin', async () => {
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
        
        const parlays = await prisma.parlay.findMany({
          where: { roundId: round.id },
          include: { player: true },
        });
        
        const loserId = determineLoser(parlays.map(p => ({
          playerId: p.playerId,
          scoreFinal: p.scoreFinal,
          legsHit: p.legsHit,
          accuracy: p.accuracy,
          completedAt: p.completedAt || undefined,
        })));
        if (!loserId) return;
        
        const approvedEntries = await prisma.wheelEntry.findMany({
          where: { roundId: round.id, status: 'approved' },
        });
        
        if (approvedEntries.length === 0) return;
        
        const entriesWithKarma = approvedEntries.map(entry => ({
          ...entry,
          weight: entry.submittedByPlayerId === loserId ? entry.weight * 1.25 : entry.weight,
        }));
        
        const commitSeed = createCommitSeed(room.id, round.id, process.env.SERVER_SALT || 'salt');
        
        io.to(`room:${roomCode}`).emit('wheel:spinning', { commitSeed });
        
        setTimeout(async () => {
          const selectedEntry = selectWeightedRandom(entriesWithKarma, commitSeed);
          if (!selectedEntry) return;
          
          const loser = await prisma.player.findUnique({ where: { id: loserId } });
          if (!loser) return;
          
          const spin = await prisma.punishmentSpin.create({
            data: {
              roundId: round.id,
              loserPlayerId: loserId,
              selectedEntryId: selectedEntry.id,
              entriesJson: approvedEntries as any,
              commitSeed,
              revealSeed: commitSeed,
            },
          });
          
          io.to(`room:${roomCode}`).emit('wheel:result', {
            selectedEntry,
            loser,
            spin,
          });
        }, 5000);
      } catch (error) {
        console.error('Error spinning wheel:', error);
        socket.emit('error', { message: 'Failed to spin wheel' });
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
          where: { roundId: round.id },
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

