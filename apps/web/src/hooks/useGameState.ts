import { useState, useCallback } from 'react';
import type { Player, Room, Round, RoomStatus } from '@parlay-party/shared';

interface GameState {
  currentPlayer: Player | null;
  room: Room | null;
  currentRound: Round | null;
  status: RoomStatus;
  hasJoined: boolean;
  loading: boolean;
  error: string | null;
}

export function useGameState() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [status, setStatus] = useState<RoomStatus>('lobby');
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGameState = useCallback((newState: Partial<GameState>) => {
    if (newState.currentPlayer !== undefined) setCurrentPlayer(newState.currentPlayer);
    if (newState.room !== undefined) setRoom(newState.room);
    if (newState.currentRound !== undefined) setCurrentRound(newState.currentRound);
    if (newState.status !== undefined) setStatus(newState.status);
    if (newState.hasJoined !== undefined) setHasJoined(newState.hasJoined);
    if (newState.loading !== undefined) setLoading(newState.loading);
    if (newState.error !== undefined) setError(newState.error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    currentPlayer,
    room,
    currentRound,
    status,
    hasJoined,
    loading,
    error,
    
    // Actions
    setCurrentPlayer,
    setRoom,
    setCurrentRound,
    setStatus,
    setHasJoined,
    setLoading,
    setError,
    updateGameState,
    clearError,
  };
}
