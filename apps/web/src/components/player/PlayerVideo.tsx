'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { audioManager } from '@/lib/audio';
import type { Player, Round } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';

interface PlayerVideoProps {
  socket: Socket;
  round: Round;
  player: Player;
}

export function PlayerVideo({ socket, round, player }: PlayerVideoProps) {
  const [lastCallTime, setLastCallTime] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const videoTimeRef = useRef(0);

  useEffect(() => {
    socket.on('host:sync', ({ tVideoSec }) => {
      videoTimeRef.current = tVideoSec;
    });

    return () => {
      socket.off('host:sync');
    };
  }, [socket]);

  const handleItHappened = () => {
    if (cooldown) return;

    const now = Date.now();
    const tVideoSec = videoTimeRef.current;

    socket.emit('vote:add', { tVideoSec });
    setLastCallTime(tVideoSec);
    audioManager.playButtonClick();

    navigator.vibrate?.(100);

    setCooldown(true);
    setTimeout(() => setCooldown(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-4"
      >
        <h1 className="font-display text-4xl glow-cyan tracking-wider">
          WATCH & CALL
        </h1>
        <p className="text-lg text-fg-subtle">
          Tap when your prediction happens!
        </p>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleItHappened}
        disabled={cooldown}
        className={`
          w-80 h-80 rounded-full
          font-display text-4xl tracking-wider
          transition-all duration-200
          ${cooldown 
            ? 'bg-bg-0 border-4 border-fg-subtle/30 text-fg-subtle cursor-not-allowed' 
            : 'btn-neon-pink breathing-glow shadow-2xl'
          }
        `}
      >
        {cooldown ? (
          <div className="space-y-2">
            <div className="text-2xl">⏱️</div>
            <div>COOLDOWN</div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-6xl">🎯</div>
            <div>IT HAPPENED!</div>
          </div>
        )}
      </motion.button>

      {lastCallTime !== null && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-neon p-6 text-center"
        >
          <p className="text-accent-1 font-semibold text-xl">
            ✓ Called @ {lastCallTime.toFixed(1)}s
          </p>
        </motion.div>
      )}

      <div className="text-center text-fg-subtle text-sm space-y-1">
        <p>Watch the host screen</p>
        <p>for video playback</p>
      </div>
    </div>
  );
}

