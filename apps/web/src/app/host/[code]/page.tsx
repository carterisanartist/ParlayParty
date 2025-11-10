'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSocket } from '@/lib/socket';
import { audioManager } from '@/lib/audio';
import { VFXLayer } from '@/components/VFXLayer';
import { HostLobby } from '@/components/host/HostLobby';
import { ParlayPhase } from '@/components/host/ParlayPhase';
import { ParlayReveal } from '@/components/host/ParlayReveal';
import { VideoPhase } from '@/components/host/VideoPhase';
import { ReviewPhase } from '@/components/host/ReviewPhase';
import { WheelPhase } from '@/components/host/WheelPhase';
import { ResultsPhase } from '@/components/host/ResultsPhase';
import type { Player, Room, Round, RoomStatus } from '@parlay-party/shared';

export default function HostPage() {
  const params = useParams();
  const roomCode = params.code as string;
  const { socket, connected } = useSocket(roomCode);
  
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [status, setStatus] = useState<RoomStatus>('lobby');
  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    if (!socket || !connected) return;

    const handleJoin = async () => {
      socket.emit('player:join', { name: 'Host' }, (response) => {
        setCurrentPlayer(response.player);
        setRoom(response.room);
        // Don't add host to players list for host view
        if (response.round) setCurrentRound(response.round);
      });
    };

    handleJoin();

    socket.on('roster:update', ({ players }) => {
      setPlayers(players);
    });

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

    socket.on('player:joined', ({ player }) => {
      audioManager.playButtonClick();
    });

    socket.on('parlay:locked', () => {
      audioManager.playLockIn();
      setShowReveal(true);
      setTimeout(() => {
        setShowReveal(false);
      }, 5000);
    });

    return () => {
      socket.off('parlay:locked');
      socket.off('roster:update');
      socket.off('room:update');
      socket.off('round:started');
      socket.off('round:status');
      socket.off('player:joined');
    };
  }, [socket, connected]);

  useEffect(() => {
    audioManager.initialize();
    if (status === 'lobby') {
      audioManager.playLobbyLoop();
    } else {
      audioManager.stopLobbyLoop();
    }
  }, [status]);

  if (!socket || !connected || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-accent-1 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-xl text-fg-subtle">Connecting to room...</p>
        </div>
      </div>
    );
  }

  return (
    <VFXLayer>
      <div className="min-h-screen p-4">
        {status === 'lobby' && (
          <HostLobby
            socket={socket}
            roomCode={roomCode}
            players={players}
            currentPlayer={currentPlayer}
          />
        )}
        
        {status === 'parlay' && currentRound && (
          <ParlayPhase
            socket={socket}
            round={currentRound}
            players={players}
          />
        )}
        
        {status === 'video' && !showReveal && currentRound && (
          <VideoPhase
            socket={socket}
            round={currentRound}
            players={players}
          />
        )}
        
        {status === 'video' && showReveal && currentRound && (
          <ParlayReveal
            socket={socket}
            round={currentRound}
            players={players}
          />
        )}
        
        {status === 'review' && currentRound && (
          <ReviewPhase
            socket={socket}
            round={currentRound}
            players={players}
          />
        )}
        
        {status === 'wheel' && currentRound && (
          <WheelPhase
            socket={socket}
            round={currentRound}
            players={players}
          />
        )}
        
        {status === 'results' && (
          <ResultsPhase
            socket={socket}
            players={players}
          />
        )}
      </div>
    </VFXLayer>
  );
}

