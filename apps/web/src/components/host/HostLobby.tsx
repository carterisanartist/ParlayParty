'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { PlayerAvatar } from '../PlayerAvatar';
import { VideoQueue } from './VideoQueue';
import type { Player } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';

interface HostLobbyProps {
  socket: Socket;
  roomCode: string;
  players: Player[];
  currentPlayer: Player;
}

export function HostLobby({ socket, roomCode, players, currentPlayer }: HostLobbyProps) {
  const handleStartRound = () => {
    // Start from queue (first video)
    socket.emit('host:startFromQueue');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-display text-8xl md:text-9xl glow-cyan tracking-wider"
        >
          PARLAY PARTY
        </motion.h1>
        
        <div className="card-neon inline-block px-12 py-6">
          <p className="text-fg-subtle text-lg mb-2 tracking-wide">ROOM CODE</p>
          <p className="font-mono text-6xl font-bold glow-pink tracking-widest">
            {roomCode}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <VideoQueue socket={socket} roomCode={roomCode} playerId={currentPlayer.id} />
        
        <div className="card-neon p-8 space-y-6">
          <h2 className="font-display text-3xl glow-violet tracking-wider">
            PLAYERS ({players.filter(p => !p.isHost).length})
          </h2>
          
          <div className="space-y-3">
            {players.filter(p => !p.isHost).map((player) => (
              <motion.div
                key={player.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-4 p-4 bg-bg-0 rounded-lg"
              >
                <PlayerAvatar player={player} size="md" />
                <div className="flex-1">
                  <p className="text-xl font-semibold">{player.name}</p>
                  {player.latencyMs > 0 && (
                    <p className="text-sm text-fg-subtle">
                      {player.latencyMs}ms latency
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {players.filter(p => !p.isHost).length === 0 && (
            <p className="text-center text-fg-subtle py-8">
              Waiting for players to join...
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartRound}
              className="btn-neon-pink py-6 px-12 text-3xl font-display tracking-widest"
            >
              START GAME
            </motion.button>
            <p className="text-fg-subtle mt-3">
              Will play videos in queue order
            </p>
          </div>
        </div>
      </div>

      <div className="text-center space-y-6">
        <div className="card-neon inline-block p-8">
          <p className="text-lg font-semibold mb-4 text-fg-subtle">SCAN TO JOIN</p>
          {typeof window !== 'undefined' && (
            <QRCodeSVG
              value={`${window.location.origin}/play/${roomCode}`}
              size={200}
              bgColor="#121212"
              fgColor="#00FFF7"
              level="H"
              className="mx-auto"
            />
          )}
          <p className="mt-4 font-mono text-lg text-accent-1">
            {typeof window !== 'undefined' && `${window.location.origin}/play/${roomCode}`}
          </p>
        </div>
      </div>
    </div>
  );
}

