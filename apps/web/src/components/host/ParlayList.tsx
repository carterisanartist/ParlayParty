'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Socket } from 'socket.io-client';

interface ParlayListProps {
  socket: Socket;
}

export function ParlayList({ socket }: ParlayListProps) {
  const [parlays, setParlays] = useState<any[]>([]);

  useEffect(() => {
    socket.on('parlay:all', ({ parlays: allParlays }) => {
      console.log('Host received parlays:', allParlays);
      setParlays(allParlays);
    });

    socket.emit('player:requestParlays');

    return () => {
      socket.off('parlay:all');
    };
  }, [socket]);

  return (
    <div className="bg-bg-0/90 backdrop-blur-sm rounded-lg p-4 border-2 border-accent-3/50">
      <h3 className="text-lg font-display text-center text-accent-3 mb-3 tracking-wider">
        WATCH FOR
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {parlays.map((parlay, index) => (
          <motion.div
            key={parlay.id}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-bg-0 rounded-lg p-3 border border-accent-3/30"
          >
            <p className="text-sm text-fg-0">"{parlay.text}"</p>
          </motion.div>
        ))}
        {parlays.length === 0 && (
          <p className="text-xs text-center text-fg-subtle py-4">
            Parlays will appear here
          </p>
        )}
      </div>
    </div>
  );
}

