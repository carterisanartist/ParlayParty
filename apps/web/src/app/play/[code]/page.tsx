'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSocket, measureLatency } from '@/lib/socket';
import { audioManager } from '@/lib/audio';
import { PlayerJoin } from '@/components/player/PlayerJoin';
import { PlayerParlay } from '@/components/player/PlayerParlay';
import { PlayerVideo } from '@/components/player/PlayerVideo';
import { PlayerWheel } from '@/components/player/PlayerWheel';
import { PlayerResults } from '@/components/player/PlayerResults';
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

  useEffect(() => {
    if (!socket || !connected) return;

    socket.on('room:update', ({ room }) => {
      setRoom(room);
      setStatus(room.status as RoomStatus);
    });

    socket.on('round:started', ({ round }) => {
      setCurrentRound(round);
      setStatus('parlay');
    });

    socket.on('round:status', ({ status }) => {
      setStatus(status as RoomStatus);
    });

    return () => {
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
      const playerWithLatency = { ...response.player, latencyMs: latency };
      setCurrentPlayer(playerWithLatency);
      setRoom(response.room);
      if (response.round) {
        setCurrentRound(response.round);
      }
      setHasJoined(true);
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
        <div className="max-w-md mx-auto text-center py-12 space-y-6">
          <h1 className="font-display text-6xl glow-cyan">
            WELCOME
          </h1>
          <div className="card-neon p-8">
            <p className="text-2xl font-semibold mb-2">{currentPlayer.name}</p>
            <p className="text-fg-subtle">Waiting for host to start...</p>
          </div>
        </div>
      )}
      
      {status === 'parlay' && currentRound && (
        <PlayerParlay
          socket={socket}
          round={currentRound}
          player={currentPlayer}
        />
      )}
      
      {status === 'video' && currentRound && (
        <PlayerVideo
          socket={socket}
          round={currentRound}
          player={currentPlayer}
        />
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
    </div>
  );
}

