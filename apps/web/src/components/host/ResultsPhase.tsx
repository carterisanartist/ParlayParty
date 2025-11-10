'use client';

import { motion } from 'framer-motion';
import { Scoreboard } from '../Scoreboard';
import { PlayerAvatar } from '../PlayerAvatar';
import type { Player } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';

interface ResultsPhaseProps {
  socket: Socket;
  players: Player[];
}

export function ResultsPhase({ socket, players }: ResultsPhaseProps) {
  const sortedPlayers = [...players].sort((a, b) => b.scoreTotal - a.scoreTotal);
  const winner = sortedPlayers[0];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <h1 className="font-display text-8xl glow-cyan tracking-wider">
          GAME OVER
        </h1>

        {winner && (
          <div className="card-neon p-12 inline-block">
            <p className="text-2xl text-fg-subtle mb-4">WINNER</p>
            <PlayerAvatar player={winner} size="lg" glow />
            <p className="text-5xl font-display mt-6 glow-pink">{winner.name}</p>
            <p className="text-3xl font-mono mt-4 text-accent-1">
              {winner.scoreTotal.toFixed(2)} pts
            </p>
          </div>
        )}
      </motion.div>

      <Scoreboard players={players} highlight={winner?.id} />

      <div className="text-center space-y-4">
        <button
          onClick={() => window.location.reload()}
          className="btn-neon-pink py-4 px-12 text-2xl font-display tracking-widest"
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

