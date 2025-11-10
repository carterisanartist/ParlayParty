'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import YouTube, { YouTubePlayer } from 'react-youtube';
import type { Player, Round, Marker } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';

interface ReviewPhaseProps {
  socket: Socket;
  round: Round;
  players: Player[];
}

export function ReviewPhase({ socket, round, players }: ReviewPhaseProps) {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [parlayText, setParlayText] = useState('');

  useEffect(() => {
    socket.emit('review:list', (response: { markers: Marker[] }) => {
      setMarkers(response.markers);
    });

    socket.on('review:markers', ({ markers: newMarkers }) => {
      setMarkers(newMarkers);
    });

    return () => {
      socket.off('review:markers');
    };
  }, [socket]);

  const handleMarkerClick = (marker: Marker) => {
    setSelectedMarker(marker);
    if (player) {
      player.seekTo(Math.max(0, marker.tVideoSec - 3), true);
      player.playVideo();
    }
  };

  const handleConfirm = () => {
    if (selectedMarker && parlayText.trim()) {
      socket.emit('review:confirm', {
        markerId: selectedMarker.id,
        tVideoSec: selectedMarker.tVideoSec,
        normalizedText: parlayText.trim().toLowerCase(),
      });
      setMarkers((prev) => prev.filter((m) => m.id !== selectedMarker.id));
      setSelectedMarker(null);
      setParlayText('');
    }
  };

  const handleSkip = () => {
    setMarkers((prev) => prev.filter((m) => m.id !== selectedMarker?.id));
    setSelectedMarker(null);
    setParlayText('');
  };

  const handleFinishReview = () => {
    socket.emit('host:endRound');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="font-display text-6xl glow-cyan tracking-wider mb-4">
          REVIEW MARKERS
        </h1>
        <p className="text-xl text-fg-subtle">
          {markers.length} marker{markers.length !== 1 ? 's' : ''} to review
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {round.videoType === 'youtube' && round.videoId && (
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <YouTube
                videoId={round.videoId}
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 0,
                    controls: 1,
                  },
                }}
                onReady={(e: any) => setPlayer(e.target)}
                className="w-full h-full"
              />
            </div>
          )}

          {selectedMarker && (
            <div className="card-neon p-6 mt-4 space-y-4">
              <h3 className="font-display text-2xl glow-pink">CONFIRM EVENT</h3>
              <p className="text-fg-subtle">Marker at {selectedMarker.tVideoSec.toFixed(1)}s</p>
              {selectedMarker.note && (
                <p className="text-accent-3">Note: {selectedMarker.note}</p>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2 text-fg-subtle">
                  WHAT HAPPENED? (Match to parlay text)
                </label>
                <input
                  type="text"
                  value={parlayText}
                  onChange={(e) => setParlayText(e.target.value)}
                  placeholder="e.g., cat jumps"
                  className="input-neon"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleConfirm}
                  disabled={!parlayText.trim()}
                  className="flex-1 btn-neon-pink py-3 text-xl disabled:opacity-50"
                >
                  ✓ CONFIRM
                </button>
                <button
                  onClick={handleSkip}
                  className="flex-1 bg-danger/20 border-2 border-danger text-danger py-3 px-6 rounded-lg text-xl font-semibold"
                >
                  SKIP
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card-neon p-6 space-y-3 max-h-[600px] overflow-y-auto">
          <h3 className="font-display text-2xl glow-violet mb-4">TIMELINE</h3>
          {markers.map((marker) => (
            <motion.div
              key={marker.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleMarkerClick(marker)}
              className={`
                p-4 rounded-lg cursor-pointer transition-all
                ${selectedMarker?.id === marker.id 
                  ? 'neon-border bg-accent-1/10' 
                  : 'bg-bg-0 hover:bg-bg-0/50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl text-accent-1">
                  {marker.tVideoSec.toFixed(1)}s
                </span>
                <span className="text-2xl">📍</span>
              </div>
              {marker.note && (
                <p className="text-sm text-fg-subtle mt-2">{marker.note}</p>
              )}
            </motion.div>
          ))}

          {markers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-fg-subtle mb-6">All markers reviewed!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFinishReview}
                className="btn-neon-pink py-4 px-8 text-xl font-display tracking-widest"
              >
                CONTINUE TO WHEEL →
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

