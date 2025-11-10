'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { audioManager } from '@/lib/audio';

interface CinematicPauseProps {
  isVisible: boolean;
  eventText: string;
  onComplete?: () => void;
}

export function CinematicPause({ isVisible, eventText, onComplete }: CinematicPauseProps) {
  useEffect(() => {
    if (isVisible) {
      audioManager.playPauseBoom();
      
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);
      
      return () => clearTimeout(timer);
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
              {eventText}
            </motion.p>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 }}
              className="text-fg-subtle text-xl"
            >
              Resuming in 3...
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

