'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayerAvatar } from '../PlayerAvatar';
import type { Player } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';

interface HostLobbyProps {
  socket: Socket;
  roomCode: string;
  players: Player[];
  currentPlayer: Player;
}

export function HostLobby({ socket, roomCode, players, currentPlayer }: HostLobbyProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState<'youtube' | 'tiktok' | 'upload'>('youtube');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleStartRound = async () => {
    if (videoType === 'upload' && uploadFile) {
      await handleUpload();
      return;
    }
    
    if (!videoUrl && videoType !== 'upload') return;

    let videoId = '';
    if (videoType === 'youtube') {
      const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      videoId = match ? match[1] : '';
    }

    socket.emit('host:startRound', {
      videoType,
      videoUrl: videoType === 'youtube' ? undefined : videoUrl,
      videoId: videoType === 'youtube' ? videoId : undefined,
    });
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video', uploadFile);
    formData.append('roundId', 'temp');

    try {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080';
      const response = await fetch(`${serverUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        socket.emit('host:startRound', {
          videoType: 'upload',
          videoUrl: `${serverUrl}${data.videoUrl}`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-display text-8xl md:text-9xl glow-cyan tracking-wider"
        >
          PARLAY PARTY
        </motion.h1>
        
        <div className="card-neon inline-block px-12 py-6">
          <p className="text-fg-subtle text-lg mb-2 tracking-wide">ROOM CODE</p>
          <p className="font-mono text-6xl font-bold glow-pink tracking-widest">
            {roomCode}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card-neon p-8 space-y-6">
          <h2 className="font-display text-3xl glow-violet tracking-wider">
            PLAYERS ({players.length})
          </h2>
          
          <div className="space-y-3">
            {players.map((player) => (
              <motion.div
                key={player.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-4 p-4 bg-bg-0 rounded-lg"
              >
                <PlayerAvatar player={player} size="md" />
                <div className="flex-1">
                  <p className="text-xl font-semibold">{player.name}</p>
                  {player.latencyMs > 0 && (
                    <p className="text-sm text-fg-subtle">
                      {player.latencyMs}ms latency
                    </p>
                  )}
                </div>
                {player.isHost && (
                  <span className="text-accent-2 font-semibold">HOST</span>
                )}
              </motion.div>
            ))}
          </div>

          {players.length === 0 && (
            <p className="text-center text-fg-subtle py-8">
              Waiting for players to join...
            </p>
          )}
        </div>

        <div className="card-neon p-8 space-y-6">
          <h2 className="font-display text-3xl glow-violet tracking-wider">
            START GAME
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-fg-subtle">
                VIDEO SOURCE
              </label>
              <div className="flex gap-2">
                {(['youtube', 'tiktok', 'upload'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setVideoType(type)}
                    className={`
                      flex-1 py-2 px-4 rounded-lg font-semibold transition-all
                      ${videoType === type ? 'btn-neon-pink' : 'bg-bg-0 text-fg-subtle'}
                    `}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {videoType !== 'upload' && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-fg-subtle">
                  VIDEO URL
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste YouTube or TikTok URL..."
                  className="input-neon"
                />
              </div>
            )}

            {videoType === 'upload' && (
              <div className="border-2 border-dashed border-accent-1 rounded-lg p-8 text-center space-y-4">
                <p className="text-fg-subtle">Upload video file (max 500MB)</p>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/mov"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadFile(file);
                    }
                  }}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="btn-neon cursor-pointer inline-block"
                >
                  CHOOSE FILE
                </label>
                {uploadFile && (
                  <div className="mt-4 p-4 bg-bg-0 rounded-lg">
                    <p className="text-accent-1 font-semibold">✓ {uploadFile.name}</p>
                    <p className="text-sm text-fg-subtle">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartRound}
              disabled={(videoType !== 'upload' && !videoUrl) || (videoType === 'upload' && !uploadFile) || uploading}
              className="w-full btn-neon-pink py-4 text-2xl font-display tracking-widest disabled:opacity-50"
            >
              {uploading ? 'UPLOADING...' : 'START ROUND'}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="text-center text-fg-subtle space-y-2">
        <p className="text-lg">Players scan the QR code or visit:</p>
        <p className="font-mono text-xl text-accent-1">
          {typeof window !== 'undefined' && `${window.location.origin}/play/${roomCode}`}
        </p>
      </div>
    </div>
  );
}

