'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Player, Round, Parlay } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';

interface ParlayRevealProps {
  socket: Socket;
  round: Round;
  players: Player[];
}

export function ParlayReveal({ socket, round, players }: ParlayRevealProps) {
  const [parlays, setParlays] = useState<Parlay[]>([]);

  useEffect(() => {
    socket.on('parlay:all', ({ parlays: allParlays }) => {
      setParlays(allParlays);
    });

    return () => {
      socket.off('parlay:all');
    };
  }, [socket]);

  const handleContinue = () => {
    // Parlays are already revealed, just acknowledge
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="font-display text-6xl glow-pink tracking-wider">
          PARLAYS LOCKED!
        </h1>
        <p className="text-2xl text-fg-subtle">
          Here's what everyone is watching for...
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parlays.map((parlay, index) => {
          const player = players.find(p => p.id === parlay.playerId);
          return (
            <motion.div
              key={parlay.id}
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="card-neon p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent-1 flex items-center justify-center font-bold text-2xl">
                  {player?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg">{player?.name}</p>
                </div>
              </div>

              <div className="bg-bg-0 rounded-lg p-4">
                <p className="text-fg-0 text-lg leading-relaxed">
                  "{parlay.text}"
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-2xl font-display glow-cyan animate-pulse">
          GET READY...
        </p>
        <p className="text-fg-subtle mt-2">
          Video starts automatically
        </p>
      </div>
    </div>
  );
}

