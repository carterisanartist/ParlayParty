'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '@/lib/audio';

interface CinematicPauseProps {
  isVisible: boolean;
  eventText: string;
  punishment?: string;
  callerName?: string;
  writerName?: string;
  onComplete?: () => void;
}

export const CinematicPause = React.memo<CinematicPauseProps>(({ isVisible, eventText, punishment, callerName, writerName, onComplete }) => {
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    if (isVisible) {
      audioManager.playPauseBoom();
      
      setCountdown(20);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ 
            opacity: 1, 
            filter: ['blur(10px)', 'saturate(0) brightness(2)', 'saturate(1) brightness(1)'] 
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="cinematic-pause-overlay"
        >
          <div className="text-center space-y-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.4 }}
              className="text-9xl"
            >
              ⏸️
            </motion.div>
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-display text-6xl md:text-8xl glow-cyan tracking-wider"
            >
              IT HAPPENED!
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-5xl text-accent-2 glow-pink font-semibold"
            >
              "{eventText}"
            </motion.p>
            
            {(callerName || writerName) && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-lg text-fg-subtle space-y-1"
              >
                {callerName && <p>Called by: <span className="text-accent-1">{callerName}</span></p>}
                {writerName && <p>Written by: <span className="text-accent-3">{writerName}</span></p>}
              </motion.div>
            )}
            
            {punishment && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
                className="card-neon p-6 bg-warning/10"
              >
                <p className="text-sm text-warning mb-2">PUNISHMENT:</p>
                <p className="text-4xl font-display glow-pink tracking-wider">
                  {punishment}
                </p>
                <p className="text-sm text-fg-subtle mt-2">(Everyone does this!)</p>
              </motion.div>
            )}
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.0 }}
              className="text-fg-subtle text-xl"
            >
              Resuming in {countdown}...
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

