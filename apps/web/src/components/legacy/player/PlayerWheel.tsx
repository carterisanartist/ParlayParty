'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Player, Round } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';

interface PlayerWheelProps {
  socket: Socket;
  round: Round;
  player: Player;
}

export function PlayerWheel({ socket, round, player }: PlayerWheelProps) {
  const [punishmentText, setPunishmentText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!punishmentText.trim()) return;

    socket.emit('wheel:submit', { text: punishmentText.trim() });
    setIsSubmitted(true);
  };

  const examplePunishments = [
    'Take a shot',
    'Post your last selfie',
    'Call your ex',
    'Do 10 pushups',
    'Sing a song',
    'Dance for 30 seconds',
  ];

  const randomExample = examplePunishments[Math.floor(Math.random() * examplePunishments.length)];

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-2"
      >
        <h1 className="font-display text-5xl glow-pink tracking-wider">
          PUNISHMENT
        </h1>
        <p className="text-lg text-fg-subtle">
          Submit a dare for the wheel!
        </p>
      </motion.div>

      {!isSubmitted ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-neon p-6 space-y-6"
        >
          <div>
            <label className="block text-sm font-semibold mb-3 text-fg-subtle">
              YOUR PUNISHMENT IDEA
            </label>
            <textarea
              value={punishmentText}
              onChange={(e) => setPunishmentText(e.target.value)}
              placeholder={`e.g., "${randomExample}"`}
              maxLength={100}
              rows={3}
              autoFocus
              className="input-neon resize-none text-lg"
            />
            <p className="text-xs text-fg-subtle mt-2 text-right">
              {punishmentText.length}/100
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!punishmentText.trim()}
            className="w-full btn-neon-pink py-5 text-2xl font-display tracking-widest disabled:opacity-50"
          >
            SUBMIT
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="card-neon p-8 text-center space-y-4"
        >
          <div className="text-6xl">✅</div>
          <h2 className="font-display text-3xl glow-cyan">
            SUBMITTED
          </h2>
          <div className="bg-bg-0 rounded-lg p-6">
            <p className="text-xl">
              "{punishmentText}"
            </p>
          </div>
          <p className="text-fg-subtle">
            Watch the host screen for the wheel spin!
          </p>
        </motion.div>
      )}
    </div>
  );
}

