'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSocket, measureLatency } from '@/lib/socket';
import { audioManager } from '@/lib/audio';
import { PlayerJoin } from '@/components/player/PlayerJoin';
import { PlayerLobby } from '@/components/player/PlayerLobby';
import { PlayerParlay } from '@/components/player/PlayerParlay';
import { PlayerReveal } from '@/components/player/PlayerReveal';
import { PlayerVideo } from '@/components/player/PlayerVideo';
import { PlayerWheel } from '@/components/player/PlayerWheel';
import { PlayerResults } from '@/components/player/PlayerResults';
import { TylerSoundPlayer } from '@/components/TylerSoundPlayer';
import type { Player, Room, Round, RoomStatus } from '@parlay-party/shared';

export default function PlayerPage() {
  const params = useParams();
  const roomCode = params.code as string;
  const { socket, connected } = useSocket(roomCode);
  
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [status, setStatus] = useState<RoomStatus>('lobby');
  const [hasJoined, setHasJoined] = useState(false);
  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    if (!socket || !connected) return;

    socket.on('room:update', ({ room }) => {
      setRoom(room);
      setStatus(room.status as RoomStatus);
    });

    socket.on('round:started', ({ round }) => {
      console.log('📱 PLAYER: Round started:', round);
      setCurrentRound(round);
      setStatus('parlay');
    });

    socket.on('round:status', ({ status }) => {
      console.log('📱 PLAYER: Status changed to:', status);
      setStatus(status as RoomStatus);
    });

    socket.on('parlay:locked', () => {
      setShowReveal(true);
      setTimeout(() => {
        setShowReveal(false);
      }, 5000);
    });

    return () => {
      socket.off('parlay:locked');
      socket.off('room:update');
      socket.off('round:started');
      socket.off('round:status');
    };
  }, [socket, connected]);

  useEffect(() => {
    audioManager.initialize();
  }, []);

  const handleJoin = async (name: string) => {
    if (!socket) return;

    const latency = await measureLatency(socket);

    socket.emit('player:join', { name }, (response) => {
      if ('error' in response) {
        console.error('Join error:', response.error);
        return;
      }
      
      console.log('📱 PLAYER: Join response:', {
        room: response.room.status,
        round: response.round?.status || 'none',
        player: response.player.name
      });
      
      const playerWithLatency = { ...response.player, latencyMs: latency };
      setCurrentPlayer(playerWithLatency);
      setRoom(response.room);
      setStatus(response.room.status as RoomStatus);
      
      // Set round if exists
      if (response.round) {
        setCurrentRound(response.round);
      }
      
      setHasJoined(true);
      
      // Handle reconnection state recovery
      if (response.parlays) {
        console.log('📱 PLAYER: Received parlays with join response:', response.parlays);
        // Trigger parlay modal display for video phase
        setTimeout(() => {
          socket.emit('parlay:all', { parlays: response.parlays });
        }, 500);
      }
    });
  };

  if (!socket || !connected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-accent-1 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-xl text-fg-subtle">Connecting...</p>
        </div>
      </div>
    );
  }

  if (!hasJoined) {
    return <PlayerJoin roomCode={roomCode} onJoin={handleJoin} />;
  }

  if (!currentPlayer) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      {status === 'lobby' && (
        <PlayerLobby
          socket={socket}
          roomCode={roomCode}
          player={currentPlayer}
        />
      )}
      
      {status === 'parlay' && currentRound && (
        <PlayerParlay
          socket={socket}
          round={currentRound}
          player={currentPlayer}
        />
      )}
      
      {status === 'video' && !showReveal && currentRound && (
        <PlayerVideo
          socket={socket}
          round={currentRound}
          player={currentPlayer}
        />
      )}
      
      {status === 'video' && showReveal && currentRound && (
        <PlayerReveal
          socket={socket}
          round={currentRound}
          player={currentPlayer}
        />
      )}
      
      {status === 'review' && (
        <div className="max-w-md mx-auto text-center py-12 space-y-6">
          <h1 className="font-display text-6xl glow-violet">REVIEW</h1>
          <div className="card-neon p-8">
            <p className="text-fg-subtle">Host is reviewing marked moments...</p>
          </div>
        </div>
      )}
      
      {status === 'wheel' && currentRound && (
        <PlayerWheel
          socket={socket}
          round={currentRound}
          player={currentPlayer}
        />
      )}
      
      {status === 'results' && (
        <PlayerResults player={currentPlayer} />
      )}
      
      <TylerSoundPlayer socket={socket} />
    </div>
  );
}

