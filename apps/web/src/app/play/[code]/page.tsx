'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { audioManager } from '@/lib/audio';
import { useSocket, measureLatency, useGameState, useErrorHandler } from '@/hooks';
import {
  PlayerJoin,
  PlayerLobby,
  PlayerParlay,
  PlayerReveal,
  PlayerVideo,
  PlayerWheel,
  PlayerResults,
  TylerSoundPlayer,
  ErrorBoundary,
  LoadingOverlay
} from '@/components';
import type { PlayerJoinResponse, PlayerJoinErrorResponse, ParleyResponseItem } from '@parlay-party/shared';

export default function PlayerPage() {
  const params = useParams();
  const roomCode = params.code as string;
  const { socket, connected } = useSocket(roomCode);
  
  const gameState = useGameState();
  const { error, setError, clearError } = useErrorHandler();
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
    </ErrorBoundary>
  );
}

