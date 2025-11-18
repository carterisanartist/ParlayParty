'use client';

import { motion } from 'framer-motion';
import { PlayerAvatar } from '../PlayerAvatar';
import type { Player } from '@parlay-party/shared';

interface PlayerResultsProps {
  player: Player;
}

export function PlayerResults({ player }: PlayerResultsProps) {
  return (
    <div className="max-w-md mx-auto py-12 space-y-8">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-6"
      >
        <h1 className="font-display text-6xl glow-cyan tracking-wider">
          YOUR SCORE
        </h1>

        <div className="card-neon p-12">
          <PlayerAvatar player={player} size="lg" glow />
          <p className="text-3xl font-semibold mt-6">{player.name}</p>
          <p className="text-6xl font-mono font-bold mt-6 glow-pink">
            {player.scoreTotal.toFixed(2)}
          </p>
          <p className="text-fg-subtle mt-2">POINTS</p>
        </div>
      </motion.div>

      <div className="text-center text-fg-subtle">
        <p>Watch the host screen</p>
        <p>for final results!</p>
      </div>
    </div>
  );
}

