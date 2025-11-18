'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { audioManager } from '@/lib/audio';
import { useSocket, measureLatency, useGameState, useErrorHandler } from '@/hooks';
import PlayerLobby from '@/components/PlayerLobby';
import PlayerParlayEntry from '@/components/mobile/PlayerParlayEntry';
import PlayerParlayLocked from '@/components/mobile/PlayerParlayLocked';
import PlayerReveal from '@/components/mobile/PlayerReveal';
import PlayerVideoPhase from '@/components/mobile/PlayerVideoPhase';
import PlayerWheelSubmit from '@/components/mobile/PlayerWheelSubmit';
import PlayerResults from '@/components/mobile/PlayerResults';
// Use legacy components temporarily
import { PlayerJoin } from '@/components/legacy/player/PlayerJoin';
import { TylerSoundPlayer } from '@/components/legacy/TylerSoundPlayer';
import { ErrorBoundary } from '@/components/legacy/ErrorBoundary';
import { LoadingOverlay } from '@/components/legacy/LoadingSpinner';
import { MobileOptimizedWrapper } from '@/components/legacy/MobileOptimizedWrapper';
import type { Player, Room, Round, RoomStatus, PlayerJoinResponse, PlayerJoinErrorResponse, ParleyResponseItem, Parlay } from '@parlay-party/shared';

export default function PlayerPage() {
  const params = useParams();
  const roomCode = params.code as string;
  const { socket, connected } = useSocket(roomCode);
  
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [parlays, setParlays] = useState<Parlay[]>([]);
  const [status, setStatus] = useState<RoomStatus>('lobby');
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    if (!socket || !connected) return;

    socket.on('room:update', ({ room }) => {
      setRoom(room);
      setStatus(room.status as RoomStatus);
    });

    socket.on('roster:update', ({ players }) => {
      setPlayers(players);
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
    };
  }, [socket, connected]);

  useEffect(() => {
    audioManager.initialize();
  }, []);

  const handleJoin = async (name: string) => {
    if (!socket) return;

    setLoading(true);
    setError(null);

    try {
      const latency = await measureLatency(socket);

      socket.emit('player:join', { name }, (response: PlayerJoinResponse | PlayerJoinErrorResponse) => {
      if ('error' in response) {
        console.error('Join error:', response.error);
        setError(response.error || 'Failed to join room');
        setLoading(false);
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
      if ('parlays' in response && response.parlays) {
        console.log('📱 PLAYER: Received parlays with join response:', response.parlays);
        // Directly set parlays for reconnection
        setTimeout(() => {
          if (response.parlays && Array.isArray(response.parlays)) {
            window.dispatchEvent(new CustomEvent<{ parlays: ParleyResponseItem[] }>('reconnection-parlays', { 
              detail: { parlays: response.parlays } 
            }));
          }
        }, 500);
      }
      
      setLoading(false);
    });
    } catch (error) {
      console.error('Join error:', error);
      setError('Failed to join room. Please try again.');
      setLoading(false);
    }
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
    <ErrorBoundary>
      <LoadingOverlay isVisible={loading} text="Joining game..." />
      
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-danger/10 border-2 border-danger text-danger p-4 rounded-lg max-w-sm">
            <p className="font-semibold mb-2">Connection Error</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-3 text-xs text-danger hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      <MobileOptimizedWrapper
        onRefresh={async () => {
          // Refresh game state - not implemented yet
          console.log('Pull to refresh triggered');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }}
        enablePullToRefresh={true}
        enableGestures={true}
        enableHaptic={true}
      >
        <div className="min-h-screen p-4">
      {status === 'lobby' && (
        <PlayerLobby
          roomCode={roomCode}
          playerName={currentPlayer.name}
          players={players.map(p => ({
            id: p.id,
            name: p.name,
            isReady: true // All players are considered ready for now
          }))}
          onLeaveRoom={() => {
            // Player leave not implemented yet
            setHasJoined(false);
          }}
        />
      )}
      
      {status === 'parlay' && currentRound && (
        <PlayerParlayEntry
          playerName={currentPlayer.name}
          videoTitle={currentRound.videoTitle || 'Video'}
          onSubmit={(prediction) => {
            socket.emit('parlay:submit', { 
              text: prediction,
              punishment: '', // Optional punishment
              frequency: 'once' // Default frequency
            });
          }}
        />
      )}
      
      {status === 'video' && !showReveal && currentRound && (
        <PlayerVideoPhase
          playerName={currentPlayer.name}
          parlays={parlays.map(p => {
            const player = players.find(pl => pl.id === p.playerId);
            return {
              id: p.id,
              playerName: player?.name || 'Unknown',
              prediction: p.text
            };
          })}
          onCallEvent={() => {
            // This would open the parlay picker modal
          }}
        />
      )}
      
      {status === 'video' && showReveal && currentRound && (
        <PlayerReveal
          currentPlayerName={currentPlayer.name}
          currentPlayerParlay={parlays.find(p => p.playerId === currentPlayer.id)?.text || ''}
          allParlays={parlays.map(p => {
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
      
      {status === 'review' && (
        <div className="max-w-md mx-auto text-center py-12 space-y-6">
          <h1 className="font-display text-6xl glow-violet">REVIEW</h1>
          <div className="card-neon p-8">
            <p className="text-fg-subtle">Host is reviewing marked moments...</p>
          </div>
        </div>
      )}
      
      {status === 'wheel' && currentRound && (
        <PlayerWheelSubmit
          playerName={currentPlayer.name}
          onSubmit={(punishment) => {
            socket.emit('wheel:submit', { text: punishment });
          }}
        />
      )}
      
      {status === 'results' && (
        <PlayerResults
          playerName={currentPlayer.name}
          score={currentPlayer.scoreTotal || 0}
          rank={1}
          totalPlayers={players.length || 1}
          correctParlays={1}
          totalParlays={1}
          onReturnToLobby={() => setStatus('lobby')}
        />
      )}
      
      <TylerSoundPlayer socket={socket} />
      </div>
      </MobileOptimizedWrapper>
    </ErrorBoundary>
  );
}

