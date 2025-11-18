'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Socket } from 'socket.io-client';

interface VerificationModalProps {
  socket: Socket;
}

interface VerifyRequest {
  callerId: string;
  callerName: string;
  parlayText: string;
  voteId: string;
}

export function VerificationModal({ socket }: VerificationModalProps) {
  const [pendingVerification, setPendingVerification] = useState<VerifyRequest | null>(null);

  useEffect(() => {
    socket.on('vote:verify', (data) => {
      console.log('Received verification request:', data);
      setPendingVerification(data);
    });

    return () => {
      socket.off('vote:verify');
    };
  }, [socket]);

  const handleResponse = (agree: boolean) => {
    if (!pendingVerification) return;
    
    socket.emit('vote:respond', {
      voteId: pendingVerification.voteId,
      agree,
    });
    
    setPendingVerification(null);
  };

  return (
    <AnimatePresence>
      {pendingVerification && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="card-neon p-8 max-w-md w-full space-y-6"
          >
            <div className="text-center space-y-4">
              <h2 className="font-display text-4xl glow-pink tracking-wider">
                VERIFY EVENT
              </h2>
              
              <div className="bg-bg-0 rounded-lg p-6 space-y-3">
                <p className="text-lg text-accent-1 font-semibold">
                  {pendingVerification.callerName} called:
                </p>
                <p className="text-2xl font-bold text-fg-0">
                  "{pendingVerification.parlayText}"
                </p>
              </div>

              <p className="text-xl text-fg-subtle">
                Did this happen?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleResponse(true)}
                className="btn-neon-pink py-6 text-2xl font-display tracking-wider"
              >
                ✓ TRUE
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleResponse(false)}
                className="bg-danger/20 border-2 border-danger text-danger py-6 text-2xl font-display tracking-wider rounded-lg"
              >
                ✗ FALSE
              </motion.button>
            </div>

            <p className="text-sm text-center text-fg-subtle">
              Majority vote wins
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

