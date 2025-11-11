'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PlayerAvatar } from './PlayerAvatar';
import type { Player } from '@parlay-party/shared';

interface GameOverModalProps {
  isVisible: boolean;
  finalScores: { id: string; name: string; scoreTotal: number }[];
  winner: { id: string; name: string; scoreTotal: number } | null;
  onNewGame?: () => void;
}

export function GameOverModal({ isVisible, finalScores, winner, onNewGame }: GameOverModalProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
            className="bg-bg-0 border-2 border-accent-1 rounded-2xl p-8 max-w-2xl w-full mx-4"
          >
            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0,
                    x: Math.random() * window.innerWidth,
                    y: -50,
                    rotate: 0,
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    y: window.innerHeight + 100,
                    rotate: 360,
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    repeatDelay: 5,
                  }}
                  className="absolute w-4 h-4 bg-gradient-to-r from-accent-1 to-accent-2 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>

            {/* Winner Section */}
            {winner && (
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mb-8"
              >
                <h1 className="text-6xl font-display tracking-wider mb-4 bg-gradient-to-r from-accent-1 to-accent-2 bg-clip-text text-transparent">
                  🏆 WINNER! 🏆
                </h1>
                
                <div className="flex items-center justify-center gap-4 mb-4">
                  <PlayerAvatar 
                    player={{ 
                      id: winner.id, 
                      name: winner.name, 
                      avatarUrl: null, 
                      isHost: false,
                      roomId: '',
                      latencyMs: 0,
                      scoreTotal: winner.scoreTotal,
                      createdAt: new Date()
                    } as Player} 
                    size="xl" 
                    glow 
                  />
                  <div>
                    <h2 className="text-4xl font-bold text-fg-primary">{winner.name}</h2>
                    <p className="text-2xl text-accent-1">{winner.scoreTotal} points</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Final Leaderboard */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-2xl font-semibold mb-4 text-center text-fg-primary">
                Final Scores
              </h3>
              
              <div className="space-y-3 mb-8">
                {finalScores.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      index === 0 
                        ? 'border-accent-1 bg-accent-1/10' 
                        : 'border-fg-subtle/30 bg-bg-1'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-fg-subtle">
                        #{index + 1}
                      </span>
                      <PlayerAvatar 
                        player={{ 
                          id: player.id, 
                          name: player.name, 
                          avatarUrl: null, 
                          isHost: false,
                          roomId: '',
                          latencyMs: 0,
                          scoreTotal: player.scoreTotal,
                          createdAt: new Date()
                        } as Player} 
                        size="md" 
                      />
                      <span className="text-xl font-semibold text-fg-primary">
                        {player.name}
                      </span>
                    </div>
                    
                    <span className="text-2xl font-bold text-accent-1">
                      {player.scoreTotal}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            {onNewGame && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="flex justify-center"
              >
                <button
                  onClick={onNewGame}
                  className="btn-neon-pink py-4 px-8 text-xl font-semibold"
                >
                  🎮 NEW GAME
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
