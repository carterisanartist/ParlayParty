'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Socket } from 'socket.io-client';

interface EventLogProps {
  socket: Socket;
}

interface LogEntry {
  id: string;
  text: string;
  time: number;
}

export function EventLog({ socket }: EventLogProps) {
  const [events, setEvents] = useState<LogEntry[]>([]);

  useEffect(() => {
    socket.on('event:confirmed', ({ event }: any) => {
      setEvents((prev) => [
        ...prev,
        {
          id: event.id,
          text: event.normalizedText,
          time: Date.now(),
        },
      ]);
    });

    return () => {
      socket.off('event:confirmed');
    };
  }, [socket]);

  return (
    <div className="bg-bg-0/90 backdrop-blur-sm rounded-lg p-4 border-2 border-accent-1/30">
      <div className="flex items-center gap-2 mb-3">
        <p className="text-sm font-semibold text-accent-1">EVENT LOG</p>
        <span className="text-xs text-fg-subtle">({events.length})</span>
      </div>
      
      <div className="space-y-2 max-h-32 overflow-y-auto">
        <AnimatePresence>
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm"
            >
              <span className="text-success">✓</span>
              <span className="text-fg-0 flex-1">"{event.text}"</span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {events.length === 0 && (
          <p className="text-xs text-fg-subtle text-center py-2">
            No events confirmed yet
          </p>
        )}
      </div>
    </div>
  );
}

