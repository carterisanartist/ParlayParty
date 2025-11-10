'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '@parlay-party/shared';
import { PlayerAvatar } from './PlayerAvatar';

interface ScoreboardProps {
  players: Player[];
  highlight?: string;
}

export function Scoreboard({ players, highlight }: ScoreboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.scoreTotal - a.scoreTotal);

  return (
    <div className="card-neon p-6 space-y-4">
      <h2 className="font-display text-4xl text-center glow-cyan tracking-wider mb-6">
        SCOREBOARD
      </h2>

      <div className="space-y-3">
        <AnimatePresence>
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center gap-4 p-4 rounded-lg
                ${highlight === player.id ? 'bg-accent-1/10 neon-border' : 'bg-bg-0'}
              `}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="font-mono text-3xl font-bold text-accent-2 w-8">
                  {index + 1}
                </span>
                
                <PlayerAvatar player={player} size="sm" glow={index === 0} />
                
                <div className="flex-1">
                  <p className="font-semibold text-lg text-fg-0">{player.name}</p>
                </div>
              </div>

              <motion.div
                key={player.scoreTotal}
                initial={{ scale: 1.5, color: '#00FFF7' }}
                animate={{ scale: 1, color: '#F5F8FF' }}
                transition={{ duration: 0.3 }}
                className="font-mono text-2xl font-bold"
              >
                {player.scoreTotal.toFixed(2)}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

