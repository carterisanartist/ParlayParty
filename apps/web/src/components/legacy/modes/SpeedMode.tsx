'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Socket } from 'socket.io-client';
import type { Player, Round } from '@parlay-party/shared';

interface SpeedModeProps {
  socket: Socket;
  roomCode: string;
  players: Player[];
  round: Round;
  onRoundComplete: () => void;
}

interface SpeedRoundTimer {
  phase: 'parlay' | 'video' | 'results';
  timeRemaining: number;
}

export function SpeedMode({ socket, roomCode, players, round, onRoundComplete }: SpeedModeProps) {
  const [timer, setTimer] = useState<SpeedRoundTimer>({ phase: 'parlay', timeRemaining: 10 });
  const [roundNumber, setRoundNumber] = useState(1);
  const [submissions, setSubmissions] = useState<Map<string, number>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Speed mode constants
  const PARLAY_TIME = 10; // 10 seconds to submit parlays
  const VIDEO_TIME = 30; // 30 seconds of video
  const RESULTS_TIME = 5; // 5 seconds to show results
  const TOTAL_ROUNDS = 10;

  useEffect(() => {
    // Initialize speed mode
    socket.emit('speed:startRound', { roundNumber });

    // Listen for speed mode events
    socket.on('speed:parlaySubmitted', ({ playerId, submissionTime }) => {
      setSubmissions(prev => new Map(prev).set(playerId, submissionTime));
    });

    socket.on('speed:phaseChange', ({ phase, timeRemaining }) => {
      setTimer({ phase, timeRemaining });
    });

    return () => {
      socket.off('speed:parlaySubmitted');
      socket.off('speed:phaseChange');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [socket, roundNumber]);

  // Timer countdown
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        const newTime = prev.timeRemaining - 1;
        
        if (newTime <= 0) {
          // Phase transition
          if (prev.phase === 'parlay') {
            socket.emit('speed:startVideo');
            return { phase: 'video', timeRemaining: VIDEO_TIME };
          } else if (prev.phase === 'video') {
            socket.emit('speed:showResults');
            return { phase: 'results', timeRemaining: RESULTS_TIME };
          } else {
            // End of round
            if (roundNumber < TOTAL_ROUNDS) {
              setRoundNumber(roundNumber + 1);
              setSubmissions(new Map());
              return { phase: 'parlay', timeRemaining: PARLAY_TIME };
            } else {
              onRoundComplete();
            }
          }
        }
        
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [socket, roundNumber, onRoundComplete]);

  const getSpeedBonus = (submissionTime: number) => {
    // Bonus points based on how quickly they submitted
    if (submissionTime <= 3) return 3; // Super fast
    if (submissionTime <= 5) return 2; // Fast
    if (submissionTime <= 7) return 1; // Normal
    return 0; // Slow
  };

  const getPhaseColor = () => {
    switch (timer.phase) {
      case 'parlay': return 'text-accent-1';
      case 'video': return 'text-accent-2';
      case 'results': return 'text-accent-3';
    }
  };

  const getPhaseGradient = () => {
    switch (timer.phase) {
      case 'parlay': return 'from-cyan-600 to-blue-600';
      case 'video': return 'from-pink-600 to-red-600';
      case 'results': return 'from-purple-600 to-violet-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-0 to-bg-1 p-8">
      {/* Header with Round Info and Timer */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center space-y-4">
          <motion.h1
            key={roundNumber}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display text-6xl md:text-8xl glow-cyan"
          >
            SPEED MODE
          </motion.h1>
          
          <div className="flex justify-center items-center space-x-8">
            <div className="card-neon px-8 py-4">
              <p className="text-fg-subtle text-sm">ROUND</p>
              <p className="text-4xl font-bold">{roundNumber}/{TOTAL_ROUNDS}</p>
            </div>
            
            <motion.div
              key={`${timer.phase}-${timer.timeRemaining}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: timer.timeRemaining <= 3 ? [1, 1.1, 1] : 1 }}
              transition={{ repeat: timer.timeRemaining <= 3 ? Infinity : 0, duration: 0.5 }}
              className={`card-neon px-12 py-4 bg-gradient-to-r ${getPhaseGradient()}`}
            >
              <p className="text-white text-sm uppercase">{timer.phase}</p>
              <p className={`text-6xl font-mono font-bold text-white ${timer.timeRemaining <= 3 ? 'animate-pulse' : ''}`}>
                {timer.timeRemaining}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {timer.phase === 'parlay' && (
            <motion.div
              key="parlay-phase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="card-neon p-12">
                <h2 className="font-display text-5xl mb-8 glow-cyan">
                  WRITE YOUR PARLAYS!
                </h2>
                <p className="text-2xl text-fg-subtle mb-4">
                  You have {timer.timeRemaining} seconds
                </p>
                <p className="text-xl text-warning">
                  ⚡ Bonus points for fast submissions!
                </p>
                
                <div className="mt-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="bg-bg-0/50 rounded-lg p-4">
                    <p className="text-3xl mb-2">⚡⚡⚡</p>
                    <p className="font-bold">3 POINTS</p>
                    <p className="text-sm text-fg-subtle">Submit in 3s</p>
                  </div>
                  <div className="bg-bg-0/50 rounded-lg p-4">
                    <p className="text-3xl mb-2">⚡⚡</p>
                    <p className="font-bold">2 POINTS</p>
                    <p className="text-sm text-fg-subtle">Submit in 5s</p>
                  </div>
                  <div className="bg-bg-0/50 rounded-lg p-4">
                    <p className="text-3xl mb-2">⚡</p>
                    <p className="font-bold">1 POINT</p>
                    <p className="text-sm text-fg-subtle">Submit in 7s</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {timer.phase === 'video' && (
            <motion.div
              key="video-phase"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center"
            >
              <div className="card-neon p-8">
                <h2 className="font-display text-4xl mb-6 glow-pink">
                  WATCH CAREFULLY!
                </h2>
                <div className="bg-bg-0 rounded-xl p-4">
                  <p className="text-2xl mb-2">30 Second Clip Playing...</p>
                  <div className="w-full bg-bg-1 rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: VIDEO_TIME, ease: 'linear' }}
                      className="h-full bg-gradient-to-r from-accent-2 to-accent-1"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {timer.phase === 'results' && (
            <motion.div
              key="results-phase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="card-neon p-8">
                <h2 className="font-display text-4xl mb-6 glow-violet text-center">
                  ROUND {roundNumber} RESULTS
                </h2>
                
                <div className="space-y-4">
                  {players.filter(p => !p.isHost).map(player => {
                    const submissionTime = submissions.get(player.id);
                    const speedBonus = submissionTime ? getSpeedBonus(submissionTime) : 0;
                    
                    return (
                      <motion.div
                        key={player.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center justify-between p-4 bg-bg-0/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <p className="text-xl font-semibold">{player.name}</p>
                          {submissionTime && (
                            <p className="text-sm text-fg-subtle">
                              Submitted in {submissionTime}s
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {speedBonus > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center space-x-1"
                            >
                              {[...Array(speedBonus)].map((_, i) => (
                                <span key={i} className="text-2xl">⚡</span>
                              ))}
                              <span className="text-success font-bold">+{speedBonus}</span>
                            </motion.div>
                          )}
                          <p className="text-2xl font-bold">{player.scoreTotal}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-2 bg-bg-0">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${(roundNumber / TOTAL_ROUNDS) * 100}%` }}
          className="h-full bg-gradient-to-r from-accent-1 to-accent-3"
        />
      </div>

      {/* Speed Mode Indicator */}
      <div className="fixed top-4 right-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-accent-1 to-accent-3 flex items-center justify-center"
        >
          <span className="text-2xl">⚡</span>
        </motion.div>
      </div>
    </div>
  );
}
