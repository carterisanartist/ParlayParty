'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Player, Round, Parlay } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';

interface PlayerRevealProps {
  socket: Socket;
  round: Round;
  player: Player;
}

export function PlayerReveal({ socket, round, player }: PlayerRevealProps) {
  const [allParlays, setAllParlays] = useState<Parlay[]>([]);
  const [myParlay, setMyParlay] = useState<Parlay | null>(null);

  useEffect(() => {
    socket.on('parlay:all', ({ parlays }) => {
      console.log('PlayerReveal received parlays:', parlays);
      setAllParlays(parlays);
      const mine = parlays.find((p: Parlay) => p.playerId === player.id);
      setMyParlay(mine || null);
    });

    // Request parlays immediately
    socket.emit('player:requestParlays');

    return () => {
      socket.off('parlay:all');
    };
  }, [socket, player.id]);

  return (
    <div className="min-h-screen flex flex-col p-4 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="font-display text-5xl glow-pink tracking-wider">
          PARLAYS LOCKED!
        </h1>
        <p className="text-lg text-fg-subtle">
          Here's what to watch for...
        </p>
      </div>

      {myParlay && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="card-neon p-6 bg-gradient-to-br from-accent-2/20 to-accent-1/20"
        >
          <p className="text-sm font-semibold text-accent-1 mb-2">YOUR PARLAY:</p>
          <p className="text-2xl font-bold">"{myParlay.text}"</p>
        </motion.div>
      )}

      <div className="card-neon p-6 space-y-3">
        <h2 className="font-display text-2xl glow-cyan mb-4">
          ALL PARLAYS:
        </h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {allParlays.map((parlay, index) => (
            <motion.div
              key={parlay.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-4 rounded-lg
                ${parlay.playerId === player.id 
                  ? 'bg-accent-1/10 border-2 border-accent-1' 
                  : 'bg-bg-0 border border-fg-subtle/30'
                }
              `}
            >
              <p className="text-fg-0">"{parlay.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-xl font-display glow-cyan animate-pulse">
          VIDEO STARTING SOON...
        </p>
        <p className="text-sm text-fg-subtle mt-2">
          Get ready to call events!
        </p>
      </div>
    </div>
  );
}

