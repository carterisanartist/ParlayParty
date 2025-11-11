'use client';

import { useState, useEffect, useRef } from 'react';
import YouTube, { YouTubePlayer } from 'react-youtube';
import { motion } from 'framer-motion';
import { CinematicPause } from '../CinematicPause';
import { Scoreboard } from '../Scoreboard';
import { EventLog } from './EventLog';
import { LiveScoreboard } from './LiveScoreboard';
import { ParlayList } from './ParlayList';
import type { Player, Round } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';

interface VideoPhaseProps {
  socket: Socket;
  round: Round;
  players: Player[];
}

function extractTikTokId(url: string): string {
  // Try multiple TikTok URL formats
  let match = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
  if (match) return match[1];
  
  match = url.match(/vm\.tiktok\.com\/([A-Za-z0-9]+)/);
  if (match) return match[1];
  
  match = url.match(/tiktok\.com\/.*\/(\d+)/);
  if (match) return match[1];
  
  // If no ID found but it's a TikTok URL, return the URL itself
  if (url.includes('tiktok.com')) {
    return encodeURIComponent(url);
  }
  
  return '';
}

interface PauseEventData {
  text: string;
  voters: string[];
  punishment?: string;
  callerName?: string;
  writerName?: string;
}

interface GameOverData {
  finalScores: Array<{ id: string; name: string; scoreTotal: number }>;
  winner: { id: string; name: string; scoreTotal: number } | null;
}

interface MarkerData {
  id: string;
  tVideoSec: number;
  note?: string;
}

export function VideoPhase({ socket, round, players }: VideoPhaseProps) {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseEvent, setPauseEvent] = useState<PauseEventData | null>(null);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [pausedPosition, setPausedPosition] = useState<number>(0);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [gameOver, setGameOver] = useState<GameOverData | null>(null);

  useEffect(() => {
    socket.on('video:pause_auto', ({ tCenter, normalizedText, voters, punishment, callerName, writerName }) => {
      console.log('🖥️ HOST: Received video:pause_auto', { normalizedText, punishment, callerName, writerName });
      if (playerRef.current) {
        // Save current position BEFORE any seeking
        const currentPos = playerRef.current.getCurrentTime();
        console.log('📍 Current video position:', currentPos, 'Event at:', tCenter);
        
        // Set the saved position for later resume
        setPausedPosition(currentPos);
        
        // Pause video at current position
        playerRef.current.pauseVideo();
        setIsPaused(true);
        setPauseEvent({ text: normalizedText, voters, punishment, callerName, writerName });
        
        // Don't seek during pause - keep video at current position
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

    socket.on('game:over', ({ finalScores, winner }) => {
      console.log('🏆 Game Over received:', { finalScores, winner });
      setGameOver({ finalScores, winner });
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
      const time = player.getCurrentTime();
      const dur = player.getDuration();
      setCurrentTime(time);
      setDuration(dur);
      socket.emit('host:sync', { tVideoSec: time });
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

  const handleSkipVideo = () => {
    if (confirm('Skip this video and go to next round?')) {
      socket.emit('host:endRound');
    }
  };

  return (
    <div className="w-full px-6 py-4 space-y-6">
      {/* Video Title */}
      {round.videoTitle && (
        <div className="text-center">
          <h2 className="font-display text-3xl glow-cyan tracking-wider">
            {round.videoTitle}
          </h2>
        </div>
      )}
      
      <div className="grid lg:grid-cols-[280px_1fr_320px] gap-6">
        {/* Left Sidebar - Counters & Parlays */}
        <div className="space-y-4 text-lg">
          <div className="bg-bg-0/90 backdrop-blur-sm rounded-lg p-5 neon-border">
            <p className="text-base text-fg-subtle mb-2 font-semibold">EVENTS</p>
            <p className="text-5xl font-mono font-bold text-accent-1">{eventCount}</p>
          </div>
          
          {markers.length > 0 && (
            <div className="bg-bg-0/90 backdrop-blur-sm rounded-lg p-5 neon-border-violet">
              <p className="text-base text-fg-subtle mb-2 font-semibold">MARKERS</p>
              <p className="text-4xl font-mono font-bold text-accent-3">{markers.length}</p>
            </div>
          )}
          
          {duration > 0 && (
            <div className="bg-bg-0/90 backdrop-blur-sm rounded-lg p-5 neon-border-pink">
              <p className="text-base text-fg-subtle mb-2 font-semibold">TIME</p>
              <p className="text-2xl font-mono font-bold text-accent-2">
                {Math.floor(currentTime)}s / {Math.floor(duration)}s
              </p>
              <div className="mt-3 h-2 bg-bg-0 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-2"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          <ParlayList socket={socket} />
        </div>
        
        {/* Center - Video Player */}
        <div className="space-y-4">
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
              onReady={(event: { target: YouTubePlayer }) => {
                setPlayer(event.target);
                playerRef.current = event.target;
              }}
              onEnd={() => setVideoEnded(true)}
              className="w-full h-full"
            />
          </div>
        )}

        {round.videoType === 'tiktok' && (round.videoUrl || round.videoId) && (
          <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
            <iframe
              src={`https://www.tiktok.com/embed/v2/${extractTikTokId(round.videoUrl || round.videoId || '')}`}
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
        
          {/* Controls & Event Log Below Video */}
          <div className="grid grid-cols-2 gap-4">
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
              className="btn-neon py-4 text-xl font-display"
            >
              {isPaused ? '▶️ PLAY' : '⏸️ PAUSE'}
            </button>
            <button
              onClick={handleMark}
              className="btn-neon-violet py-4 text-xl font-display"
            >
              📍 MARK
            </button>
          </div>

          <EventLog socket={socket} />
          
          <button
            onClick={handleSkipVideo}
            className="w-full px-6 py-3 bg-danger/20 border-2 border-danger text-danger rounded-lg font-semibold hover:bg-danger/30 text-lg"
          >
            ⏭️ SKIP VIDEO
          </button>
        </div>
        </div>
        
        {/* Right Sidebar - Live Scoreboard */}
        <div>
          <LiveScoreboard socket={socket} players={players} />
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
        punishment={pauseEvent?.punishment}
        callerName={pauseEvent?.callerName}
        writerName={pauseEvent?.writerName}
        onComplete={() => {
          setPauseEvent(null);
          setIsPaused(false);
          
          // Resume video where it was paused
          if (playerRef.current) {
            console.log('▶️ Resuming video at current position');
            playerRef.current.playVideo();
          }
        }}
      />

      {gameOver && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center">
          <div className="bg-bg-0 border-2 border-accent-1 rounded-2xl p-8 max-w-lg text-center">
            <h1 className="text-4xl font-display mb-4 text-accent-1">🏆 GAME OVER! 🏆</h1>
            {gameOver.winner && (
              <h2 className="text-2xl mb-4">Winner: {gameOver.winner.name} ({gameOver.winner.scoreTotal} pts)</h2>
            )}
            <button
              onClick={() => window.location.href = '/'}
              className="btn-neon-pink py-3 px-6"
            >
              NEW GAME
            </button>
          </div>
        </div>
      )}

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
            NEXT VIDEO →
          </motion.button>
        </div>
      )}
    </div>
  );
}

