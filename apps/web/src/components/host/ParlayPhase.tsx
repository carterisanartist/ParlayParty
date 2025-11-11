'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayerAvatar } from '../PlayerAvatar';
import type { Player, Round, Parlay } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';

interface ParlayPhaseProps {
  socket: Socket;
  round: Round;
  players: Player[];
}

export function ParlayPhase({ socket, round, players }: ParlayPhaseProps) {
  const [submittedPlayers, setSubmittedPlayers] = useState<Set<string>>(new Set());

  useEffect(() => {
    socket.on('parlay:progress', ({ playerId, submitted }) => {
      if (submitted) {
        setSubmittedPlayers((prev) => new Set(prev).add(playerId));
      }
    });

    return () => {
      socket.off('parlay:progress');
    };
  }, [socket]);

  // Auto-lock when all players submit
  useEffect(() => {
    const nonHostPlayers = players.filter(p => !p.isHost);
    if (nonHostPlayers.length === 0) return; // Skip if no players yet
    
    const nonHostSubmitted = Array.from(submittedPlayers).filter(id => 
      nonHostPlayers.some(p => p.id === id)
    );
    
    console.log(`📊 Parlay progress: ${nonHostSubmitted.length}/${nonHostPlayers.length}`);
    
    if (nonHostSubmitted.length === nonHostPlayers.length && nonHostPlayers.length > 0) {
      console.log('✅ All players submitted, auto-locking in 1 second');
      setTimeout(() => {
        socket.emit('parlay:lock');
      }, 1000);
    }
  }, [submittedPlayers, players, socket]);

  const handleLock = () => {
    socket.emit('parlay:lock');
  };

  const nonHostPlayers = players.filter(p => !p.isHost);
  const progress = nonHostPlayers.length > 0 
    ? (Array.from(submittedPlayers).filter(id => nonHostPlayers.some(p => p.id === id)).length / nonHostPlayers.length) * 100
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="font-display text-6xl glow-cyan tracking-wider">
          PARLAY ENTRY
        </h1>
        <p className="text-2xl text-fg-subtle">
          Players are making their predictions...
        </p>
      </div>

      <div className="card-neon p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold">
              {Array.from(submittedPlayers).filter(id => nonHostPlayers.some(p => p.id === id)).length} / {nonHostPlayers.length} Players Locked In
            </span>
            <span className="text-accent-1 font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="h-4 bg-bg-0 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full animated-gradient"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {players.map((player) => {
            const submitted = submittedPlayers.has(player.id);
            return (
              <motion.div
                key={player.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{ duration: 0.3 }}
                className={`
                  p-4 rounded-xl text-center space-y-2
                  ${submitted ? 'neon-border bg-bg-0' : 'bg-bg-0 border-2 border-fg-subtle/30'}
                `}
              >
                <PlayerAvatar player={player} size="md" glow={submitted} />
                <p className="font-semibold text-sm truncate">{player.name}</p>
                {submitted && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-accent-1 font-semibold"
                  >
                    ✓ LOCKED
                  </motion.p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLock}
          className="btn-neon-pink py-4 px-12 text-2xl font-display tracking-widest"
        >
          LOCK ALL & START VIDEO
        </motion.button>
      </div>
    </div>
  );
}

