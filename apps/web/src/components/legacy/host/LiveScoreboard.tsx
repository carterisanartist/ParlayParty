'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Player } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';

interface LiveScoreboardProps {
  socket: Socket;
  players: Player[];
}

export function LiveScoreboard({ socket, players }: LiveScoreboardProps) {
  const [liveScores, setLiveScores] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize scores
    const scores: Record<string, number> = {};
    players.forEach(p => {
      scores[p.id] = p.scoreTotal;
    });
    setLiveScores(scores);

    socket.on('scoreboard:update', ({ scores: updates }) => {
      updates.forEach((update: any) => {
        setLiveScores(prev => ({
          ...prev,
          [update.playerId]: update.newTotal,
        }));
      });
    });

    return () => {
      socket.off('scoreboard:update');
    };
  }, [socket, players]);

  const sortedPlayers = [...players]
    .sort((a, b) => (liveScores[b.id] || 0) - (liveScores[a.id] || 0))
    .filter(p => !p.isHost);

  return (
    <div className="bg-bg-0/90 backdrop-blur-sm rounded-lg p-4 border-2 border-accent-1/50">
      <h3 className="text-lg font-display text-center text-accent-1 mb-3 tracking-wider">
        LIVE SCORES
      </h3>
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            animate={{ scale: liveScores[player.id] !== player.scoreTotal ? [1, 1.1, 1] : 1 }}
            className="flex items-center justify-between px-3 py-2 bg-bg-0 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-accent-2 font-bold text-lg">#{index + 1}</span>
              <span className="text-fg-0 font-semibold">{player.name}</span>
            </div>
            <span className="text-2xl font-mono font-bold text-accent-1">
              {liveScores[player.id] || 0}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

