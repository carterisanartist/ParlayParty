'use client';

import { motion } from 'framer-motion';
import type { Parlay, Player } from '@parlay-party/shared';

interface ParlayCardProps {
  parlay: Parlay;
  player: Player;
  hit?: boolean;
  revealed?: boolean;
}

export function ParlayCard({ parlay, player, hit, revealed = true }: ParlayCardProps) {
  const borderClass = hit === undefined 
    ? 'neon-border' 
    : hit 
      ? 'border-2 border-success shadow-lg shadow-success/50'
      : 'border-2 border-danger shadow-lg shadow-danger/50';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: revealed ? 0 : 180 }}
      animate={{ opacity: 1, scale: 1, rotateY: revealed ? 0 : 180 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className={`${borderClass} bg-bg-1 rounded-xl p-6 space-y-4`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent-1 flex items-center justify-center font-bold">
          {player.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-fg-0">{player.name}</p>
          {parlay.scoreFinal > 0 && (
            <p className="text-sm text-accent-2 font-mono">
              +{parlay.scoreFinal.toFixed(2)} pts
            </p>
          )}
        </div>
      </div>

      {revealed && (
        <div className="bg-bg-0 rounded-lg p-4">
          <p className="text-fg-0 text-lg leading-relaxed">
            "{parlay.text}"
          </p>
        </div>
      )}

      {!revealed && (
        <div className="bg-bg-0 rounded-lg p-4 flex items-center justify-center h-24">
          <p className="text-accent-1 text-xl font-display tracking-wider">LOCKED</p>
        </div>
      )}

      {hit !== undefined && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-fg-subtle">
            {parlay.legsHit} hit{parlay.legsHit !== 1 ? 's' : ''}
          </span>
          <span className={hit ? 'text-success' : 'text-danger'}>
            {hit ? '✅ HIT' : '❌ MISS'}
          </span>
        </div>
      )}
    </motion.div>
  );
}

