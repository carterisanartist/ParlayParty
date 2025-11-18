'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { VideoQueue } from '../host/VideoQueue';
import type { Player } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';

interface PlayerLobbyProps {
  socket: Socket;
  roomCode: string;
  player: Player;
}

export function PlayerLobby({ socket, roomCode, player }: PlayerLobbyProps) {
  return (
    <div className="max-w-md mx-auto space-y-6 py-6">
      <div className="text-center space-y-4">
        <h1 className="font-display text-5xl glow-cyan tracking-wider">
          WELCOME
        </h1>
        <div className="card-neon p-6">
          <p className="text-2xl font-semibold mb-2">{player.name}</p>
          <p className="text-sm text-fg-subtle">Waiting for host to start...</p>
        </div>
      </div>

      <VideoQueue socket={socket} roomCode={roomCode} playerId={player.id} />

      <div className="text-center text-fg-subtle text-sm">
        <p>Add videos for the queue!</p>
        <p>Host will start when ready.</p>
      </div>
    </div>
  );
}

