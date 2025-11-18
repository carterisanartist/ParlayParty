'use client';

import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import HostLobby from '../HostLobby';
import type { Player } from '@parlay-party/shared';

interface HostLobbyAdapterProps {
  socket: Socket;
  roomCode: string;
  players: Player[];
  currentPlayer: Player;
}

export function HostLobbyAdapter({ socket, roomCode, players, currentPlayer }: HostLobbyAdapterProps) {
  const handleStartGame = () => {
    socket.emit('host:startFromQueue');
  };

  // The new HostLobby manages its own state, but we need to sync it with socket events
  useEffect(() => {
    // The new component will handle its own player list internally
    // We'll need to integrate socket events within the HostLobby component itself
  }, [socket, players]);

  return (
    <HostLobby
      roomCode={roomCode}
      onStartGame={handleStartGame}
    />
  );
}
