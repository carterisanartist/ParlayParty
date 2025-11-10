'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import YouTube from 'react-youtube';
import { audioManager } from '@/lib/audio';
import type { Player, Round, Parlay } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';

interface PlayerVideoProps {
  socket: Socket;
  round: Round;
  player: Player;
}

export function PlayerVideo({ socket, round, player }: PlayerVideoProps) {
  const [lastCallTime, setLastCallTime] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [showParlayPicker, setShowParlayPicker] = useState(false);
  const [allParlays, setAllParlays] = useState<Parlay[]>([]);
  const [showVideoOnPhone, setShowVideoOnPhone] = useState(false);
  const videoTimeRef = useRef(0);

  useEffect(() => {
    // Set up listeners FIRST
    socket.on('host:sync', ({ tVideoSec }) => {
      videoTimeRef.current = tVideoSec;
    });

    socket.on('parlay:all', ({ parlays }) => {
      console.log('PlayerVideo received parlays:', parlays);
      if (Array.isArray(parlays)) {
        setAllParlays(parlays);
      } else {
        console.error('Parlays is not an array:', parlays);
      }
    });

    // Request parlays immediately in case we missed the broadcast
    socket.emit('player:requestParlays');

    return () => {
      socket.off('host:sync');
      socket.off('parlay:all');
    };
  }, [socket]);

  console.log('Current parlays in PlayerVideo state:', allParlays.length, allParlays);

  const handleItHappened = () => {
    if (cooldown) return;
    setShowParlayPicker(true);
    audioManager.playButtonClick();
  };

  const handleSelectParlay = (normalizedText: string) => {
    const tVideoSec = videoTimeRef.current;

    socket.emit('vote:add', { tVideoSec, normalizedText });
    setLastCallTime(tVideoSec);
    setShowParlayPicker(false);

    navigator.vibrate?.(100);

    setCooldown(true);
    setTimeout(() => setCooldown(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 space-y-6">
      {/* Video Toggle */}
      <div className="flex justify-between items-center">
        <h1 className="font-display text-2xl glow-cyan">WATCH & CALL</h1>
        <button
          onClick={() => setShowVideoOnPhone(!showVideoOnPhone)}
          className="px-4 py-2 rounded-lg border-2 border-accent-3 text-accent-3 text-sm font-semibold"
        >
          {showVideoOnPhone ? '📱 Hide Video' : '📺 Show Video'}
        </button>
      </div>

      {/* Optional Video on Phone */}
      {showVideoOnPhone && round.videoType === 'youtube' && round.videoId && (
        <div className="card-neon p-2">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <YouTube
              videoId={round.videoId}
              opts={{
                width: '100%',
                height: '100%',
                playerVars: {
                  autoplay: 0,
                  controls: 1,
                  modestbranding: 1,
                },
              }}
              className="w-full h-full"
            />
          </div>
          <p className="text-xs text-center text-fg-subtle mt-2">
            Syncs with host screen
          </p>
        </div>
      )}

      {/* Show All Parlays */}
      <div className="card-neon p-4 max-w-2xl mx-auto w-full">
        <h2 className="font-display text-xl glow-cyan mb-3 text-center">
          WATCH FOR THESE:
        </h2>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {allParlays.map((parlay) => (
            <div
              key={parlay.id}
              className="bg-bg-0 rounded-lg p-3 border border-accent-1/30"
            >
              <p className="text-sm text-fg-0">"{parlay.text}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* It Happened Button */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleItHappened}
          disabled={cooldown}
          className={`
            w-72 h-72 rounded-full
            font-display text-3xl tracking-wider
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
            className="card-neon p-4 text-center"
          >
            <p className="text-accent-1 font-semibold text-lg">
              ✓ Called @ {lastCallTime.toFixed(1)}s
            </p>
          </motion.div>
        )}
      </div>

      {/* Parlay Picker Modal */}
      <AnimatePresence>
        {showParlayPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowParlayPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card-neon p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
              <h2 className="font-display text-3xl glow-pink mb-6 text-center">
                WHAT HAPPENED?
              </h2>

              {allParlays.length === 0 && (
                <p className="text-center text-fg-subtle py-8">
                  Loading parlays...
                </p>
              )}

              <div className="space-y-3">
                {allParlays.map((parlay) => (
                  <motion.button
                    key={parlay.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectParlay(parlay.normalizedText)}
                    className="w-full bg-bg-0 border-2 border-accent-1 rounded-lg p-4 text-left hover:bg-accent-1/10 transition-all"
                  >
                    <p className="text-lg font-semibold text-fg-0">
                      "{parlay.text}"
                    </p>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => setShowParlayPicker(false)}
                className="w-full mt-6 py-3 bg-danger/20 border-2 border-danger text-danger rounded-lg font-semibold"
              >
                CANCEL
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center text-fg-subtle text-sm">
        <p>{showVideoOnPhone ? 'Video syncs with host' : 'Watch the host screen'}</p>
        <p className="text-xs mt-1">Toggle video above if needed</p>
      </div>
    </div>
  );
}
