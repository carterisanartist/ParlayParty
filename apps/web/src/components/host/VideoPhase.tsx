'use client';

import { useState, useEffect, useRef } from 'react';
import YouTube, { YouTubePlayer } from 'react-youtube';
import { motion } from 'framer-motion';
import { CinematicPause } from '../CinematicPause';
import { Scoreboard } from '../Scoreboard';
import { EventLog } from './EventLog';
import type { Player, Round } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';

interface VideoPhaseProps {
  socket: Socket;
  round: Round;
  players: Player[];
}

function extractTikTokId(url: string): string {
  const match = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
  return match ? match[1] : '';
}

export function VideoPhase({ socket, round, players }: VideoPhaseProps) {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseEvent, setPauseEvent] = useState<{ text: string; voters: string[] } | null>(null);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    socket.on('video:pause_auto', ({ tCenter, normalizedText, voters }) => {
      if (player) {
        player.pauseVideo();
        player.seekTo(tCenter, true);
        setIsPaused(true);
        setPauseEvent({ text: normalizedText, voters });
      }
    });

    socket.on('video:resume', () => {
      if (player) {
        player.playVideo();
        setIsPaused(false);
        setPauseEvent(null);
      }
    });

    socket.on('video:play', () => {
      if (player) {
        player.playVideo();
      }
    });

    socket.on('video:pause', () => {
      if (player) {
        player.pauseVideo();
      }
    });

    socket.on('video:seek', ({ tVideoSec }) => {
      if (player) {
        player.seekTo(tVideoSec, true);
      }
    });

    socket.on('event:confirmed', () => {
      setEventCount((prev) => prev + 1);
    });

    socket.on('scoreboard:update', () => {
      setShowScoreboard(true);
      setTimeout(() => setShowScoreboard(false), 5000);
    });

    socket.on('marker:added', ({ marker }) => {
      setMarkers((prev) => [...prev, marker]);
    });

    return () => {
      socket.off('marker:added');
      socket.off('event:confirmed');
      socket.off('video:pause_auto');
      socket.off('video:resume');
      socket.off('video:play');
      socket.off('video:pause');
      socket.off('video:seek');
      socket.off('scoreboard:update');
    };
  }, [socket, player]);

  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      const currentTime = player.getCurrentTime();
      socket.emit('host:sync', { tVideoSec: currentTime });
    }, 1000);

    return () => clearInterval(interval);
  }, [player, socket]);

  const handleConfirm = () => {
    if (pauseEvent) {
      const tCenter = player?.getCurrentTime() || 0;
      socket.emit('host:confirmEvent', {
        tCenter,
        normalizedText: pauseEvent.text,
      });
    }
  };

  const handleDismiss = () => {
    if (pauseEvent && player) {
      const tCenter = player.getCurrentTime();
      socket.emit('host:dismissEvent', {
        tCenter,
        normalizedText: pauseEvent.text,
      });
      player.playVideo();
      setIsPaused(false);
      setPauseEvent(null);
    }
  };

  const handleMark = () => {
    if (player) {
      const tVideoSec = player.getCurrentTime();
      const note = prompt('Add note (optional):') || '';
      socket.emit('host:mark', { tVideoSec, note });
      
      // Visual feedback
      const tempMarker = document.createElement('div');
      tempMarker.textContent = '📍 Marked';
      tempMarker.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#00FFF7;color:#0B0B0B;padding:16px 32px;border-radius:8px;font-weight:bold;z-index:9999;';
      document.body.appendChild(tempMarker);
      setTimeout(() => tempMarker.remove(), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Video Title */}
      {round.videoTitle && (
        <div className="text-center">
          <h2 className="font-display text-3xl glow-cyan tracking-wider">
            {round.videoTitle}
          </h2>
        </div>
      )}
      
      <div className="relative">
        {round.videoType === 'youtube' && round.videoId && (
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            <YouTube
              videoId={round.videoId}
              opts={{
                width: '100%',
                height: '100%',
                playerVars: {
                  autoplay: 1,
                  controls: 1,
                },
              }}
              onReady={(e: any) => setPlayer(e.target)}
              onEnd={() => setVideoEnded(true)}
              className="w-full h-full"
            />
          </div>
        )}

        {round.videoType === 'tiktok' && round.videoUrl && (
          <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
            <iframe
              src={`https://www.tiktok.com/embed/v2/${extractTikTokId(round.videoUrl)}`}
              className="w-full h-full"
              allow="encrypted-media;"
              allowFullScreen
            />
            <div className="absolute bottom-4 left-4 bg-bg-0/90 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-warning">⚠️ TikTok embeds may be restricted. Watch on host screen only.</p>
            </div>
          </div>
        )}

        {round.videoType === 'upload' && round.videoUrl && (
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            <video
              src={round.videoUrl}
              controls
              autoPlay
              onEnded={() => setVideoEnded(true)}
              className="w-full h-full"
            />
          </div>
        )}
        
        {/* Event Log Below Video */}
        <EventLog socket={socket} />

        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <div className="space-y-2 pointer-events-auto">
            <div className="bg-bg-0/90 backdrop-blur-sm rounded-lg p-4 neon-border">
              <p className="text-sm text-fg-subtle mb-1">EVENTS</p>
              <p className="text-3xl font-mono font-bold text-accent-1">{eventCount}</p>
            </div>
            {markers.length > 0 && (
              <div className="bg-bg-0/90 backdrop-blur-sm rounded-lg p-4 neon-border-violet">
                <p className="text-sm text-fg-subtle mb-1">MARKERS</p>
                <p className="text-2xl font-mono font-bold text-accent-3">{markers.length}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pointer-events-auto">
            <button
              onClick={() => {
                if (player) {
                  if (isPaused) {
                    player.playVideo();
                    socket.emit('host:play');
                  } else {
                    player.pauseVideo();
                    socket.emit('host:pause');
                  }
                  setIsPaused(!isPaused);
                }
              }}
              className="btn-neon px-4"
            >
              {isPaused ? '▶️ PLAY' : '⏸️ PAUSE'}
            </button>
            <button
              onClick={handleMark}
              className="btn-neon-violet"
            >
              📍 MARK
            </button>
          </div>
        </div>
      </div>

      {isPaused && pauseEvent && (
        <div className="card-neon p-6 space-y-4">
          <h3 className="font-display text-3xl glow-cyan">PAUSE - CONFIRM EVENT?</h3>
          <p className="text-2xl text-accent-2">"{pauseEvent.text}"</p>
          <p className="text-fg-subtle">
            Called by {pauseEvent.voters.length} player(s)
          </p>
          <div className="flex gap-4">
            <button onClick={handleConfirm} className="flex-1 btn-neon-pink py-3 text-xl">
              ✓ CONFIRM
            </button>
            <button onClick={handleDismiss} className="flex-1 bg-danger/20 border-2 border-danger text-danger py-3 px-6 rounded-lg text-xl font-semibold">
              ✗ DISMISS
            </button>
          </div>
        </div>
      )}

      {showScoreboard && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-96">
          <Scoreboard players={players} />
        </div>
      )}

      <CinematicPause
        isVisible={isPaused && !!pauseEvent}
        eventText={pauseEvent?.text || ''}
      />

      {videoEnded && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => socket.emit('host:endRound')}
            className="btn-neon-pink py-6 px-12 text-3xl font-display tracking-widest shadow-2xl"
          >
            END ROUND →
          </motion.button>
        </div>
      )}
    </div>
  );
}

