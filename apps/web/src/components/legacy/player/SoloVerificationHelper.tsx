'use client';

import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';

interface SoloVerificationHelperProps {
  socket: Socket;
}

export function SoloVerificationHelper({ socket }: SoloVerificationHelperProps) {
  useEffect(() => {
    // Auto-respond TRUE to own verification requests in solo mode
    socket.on('vote:verify', ({ voteId }) => {
      console.log('Solo mode: Auto-approving own vote');
      // Wait 1 second then auto-approve (faster for testing)
      setTimeout(() => {
        socket.emit('vote:respond', { voteId, agree: true });
      }, 1000);
    });

    return () => {
      socket.off('vote:verify');
    };
  }, [socket]);

  return null; // No UI, just logic
}

