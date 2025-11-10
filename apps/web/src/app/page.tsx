'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateRoomCode } from '@parlay-party/shared';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = () => {
    setIsCreating(true);
    const code = generateRoomCode(4);
    setTimeout(() => {
      router.push(`/host/${code}`);
    }, 300);
  };

  const handleJoinRoom = () => {
    if (roomCode.length >= 4) {
      router.push(`/play/${roomCode.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-12">
          <h1 className="font-display text-8xl md:text-9xl glow-cyan mb-4 tracking-wider">
            PARLAY PARTY
          </h1>
          <p className="text-fg-subtle text-xl md:text-2xl tracking-wide">
            Predict. Compete. Get Punished.
          </p>
        </div>

        <div className="card-neon p-8 md:p-12 space-y-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full btn-neon-pink text-2xl py-6 font-display tracking-widest"
          >
            {isCreating ? 'CREATING...' : 'CREATE ROOM'}
          </motion.button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-fg-subtle opacity-30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-bg-1 text-fg-subtle tracking-wider">OR</span>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              maxLength={6}
              className="input-neon text-center text-2xl tracking-widest font-mono"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinRoom}
              disabled={roomCode.length < 4}
              className="w-full btn-neon text-2xl py-6 font-display tracking-widest disabled:opacity-50"
            >
              JOIN ROOM
            </motion.button>
          </div>
        </div>

        <div className="mt-8 text-center text-fg-subtle text-sm tracking-wide">
          <p>Host on desktop/TV • Play on mobile</p>
        </div>
      </motion.div>
    </div>
  );
}

