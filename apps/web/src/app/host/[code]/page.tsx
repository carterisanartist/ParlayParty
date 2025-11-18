'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSocket } from '@/lib/socket';
import { audioManager } from '@/lib/audio';
import { VFXLayer } from '@/components/legacy/VFXLayer';
import HostLobby from '@/components/HostLobby';
import HostParlayEntry from '@/components/host/HostParlayEntry';
import HostParlayReveal from '@/components/host/HostParlayReveal';
import HostVideoPhase from '@/components/host/HostVideoPhase';
import HostResults from '@/components/host/HostResults';
import HostWheelPhase from '@/components/host/HostWheelPhase';
// Temporarily use legacy components for missing ones
import { ReviewPhase } from '@/components/legacy/host/ReviewPhase';
import { TylerSoundPlayer } from '@/components/legacy/TylerSoundPlayer';
import type { Player, Room, Round, RoomStatus, Parlay } from '@parlay-party/shared';

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
  const [parlays, setParlays] = useState<Parlay[]>([]);

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

    socket.on('parlay:all', ({ parlays }) => {
      setParlays(parlays);
    });

    return () => {
      socket.off('parlay:locked');
      socket.off('parlay:all');
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
            onStartGame={() => setStatus('parlay')}
          />
        )}
        
        {status === 'parlay' && currentRound && (
          <HostParlayEntry
            players={players.map(p => ({ ...p, locked: false }))}
            onForceStart={() => setStatus('video')}
            onRemovePlayer={(playerId) => {
              // Player removal not implemented in socket events yet
              console.log('Remove player:', playerId);
            }}
          />
        )}
        
        {status === 'video' && !showReveal && currentRound && (
          <HostVideoPhase
            parlays={parlays.map(p => {
              const player = players.find(pl => pl.id === p.playerId);
              return {
                id: p.id,
                playerName: player?.name || 'Unknown',
                prediction: p.text,
                completed: p.completedAt != null
              };
            })}
            players={players.map(p => ({
              id: p.id,
              name: p.name,
              score: p.scoreTotal
            }))}
            videoUrl={currentRound.videoUrl || ''}
            onSkip={() => setStatus('review')}
          />
        )}
        
        {status === 'video' && showReveal && currentRound && (
          <HostParlayReveal
            parlays={parlays.map(p => {
              const player = players.find(pl => pl.id === p.playerId);
              return {
                id: p.id,
                playerName: player?.name || 'Unknown',
                prediction: p.text
              };
            })}
            onRevealComplete={() => setShowReveal(false)}
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
          <HostWheelPhase
            punishments={[]}
            onComplete={(punishment) => {
              // Wheel selection is complete
              console.log('Wheel punishment:', punishment);
            }}
          />
        )}
        
        {status === 'results' && (
          <HostResults
            players={players.map(p => ({
              id: p.id,
              name: p.name,
              score: p.scoreTotal
            }))}
            onContinue={() => setStatus('lobby')}
            onReturnToLobby={() => setStatus('lobby')}
          />
        )}
      </div>
      
      <TylerSoundPlayer socket={socket} />
    </VFXLayer>
  );
}

