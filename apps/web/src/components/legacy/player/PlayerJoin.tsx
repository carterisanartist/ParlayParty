'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PlayerJoinProps {
  roomCode: string;
  onJoin: (name: string) => void;
}

export function PlayerJoin({ roomCode, onJoin }: PlayerJoinProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <h1 className="font-display text-7xl glow-cyan tracking-wider mb-4">
            JOIN ROOM
          </h1>
          <div className="card-neon inline-block px-8 py-4">
            <p className="text-sm text-fg-subtle mb-1">ROOM CODE</p>
            <p className="font-mono text-4xl font-bold glow-pink tracking-widest">
              {roomCode}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-neon p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-fg-subtle">
              YOUR NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={20}
              autoFocus
              className="input-neon text-xl"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!name.trim()}
            className="w-full btn-neon-pink py-4 text-2xl font-display tracking-widest disabled:opacity-50"
          >
            JOIN PARTY
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

