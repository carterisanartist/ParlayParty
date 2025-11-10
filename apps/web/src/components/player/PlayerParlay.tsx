'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { audioManager } from '@/lib/audio';
import type { Player, Round } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';

interface PlayerParlayProps {
  socket: Socket;
  round: Round;
  player: Player;
}

export function PlayerParlay({ socket, round, player }: PlayerParlayProps) {
  const [parlayText, setParlayText] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const examplePredictions = [
    'Someone screams',
    'The cat jumps',
    'A car alarm goes off',
    'Something breaks',
    'Someone says "oh no"',
  ];

  const randomExample = examplePredictions[Math.floor(Math.random() * examplePredictions.length)];

  const handleLockIn = () => {
    if (!parlayText.trim()) return;

    socket.emit('parlay:submit', { text: parlayText.trim() });
    setIsLocked(true);
    audioManager.playLockIn();
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-2"
      >
        <h1 className="font-display text-5xl glow-cyan tracking-wider">
          PREDICT
        </h1>
        <p className="text-lg text-fg-subtle">
          What will happen in this video?
        </p>
      </motion.div>

      {!isLocked ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card-neon p-6 space-y-6"
        >
          <div>
            <label className="block text-sm font-semibold mb-3 text-fg-subtle">
              YOUR PREDICTION
            </label>
            <textarea
              value={parlayText}
              onChange={(e) => setParlayText(e.target.value)}
              placeholder={`e.g., "${randomExample}"`}
              maxLength={200}
              rows={4}
              autoFocus
              className="input-neon resize-none text-lg"
            />
            <p className="text-xs text-fg-subtle mt-2 text-right">
              {parlayText.length}/200
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLockIn}
            disabled={!parlayText.trim()}
            className="w-full btn-neon-pink py-5 text-2xl font-display tracking-widest disabled:opacity-50"
          >
            🔒 LOCK IN
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ rotateY: 180 }}
          animate={{ rotateY: 0 }}
          transition={{ duration: 0.5 }}
          className="card-neon p-8 space-y-6 bg-gradient-to-br from-accent-1/10 to-accent-2/10"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-6xl mb-4"
            >
              🔒
            </motion.div>
            <h2 className="font-display text-3xl glow-cyan mb-4">
              LOCKED IN
            </h2>
          </div>

          <div className="bg-bg-0 rounded-lg p-6">
            <p className="text-xl leading-relaxed">
              "{parlayText}"
            </p>
          </div>

          <p className="text-center text-fg-subtle">
            Waiting for other players...
          </p>
        </motion.div>
      )}
    </div>
  );
}

