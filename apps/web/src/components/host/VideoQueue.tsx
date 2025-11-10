'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Socket } from 'socket.io-client';
import type { VideoQueueItem } from '@parlay-party/shared';

interface VideoQueueProps {
  socket: Socket;
  roomCode: string;
  playerId: string;
}

export function VideoQueue({ socket, roomCode, playerId }: VideoQueueProps) {
  const [videos, setVideos] = useState<VideoQueueItem[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState<'youtube' | 'tiktok'>('youtube');
  const [title, setTitle] = useState('');

  useEffect(() => {
    socket.on('queue:updated', ({ videos: updatedVideos }) => {
      setVideos(updatedVideos.sort((a, b) => a.order - b.order));
    });

    return () => {
      socket.off('queue:updated');
    };
  }, [socket]);

  const handleAddVideo = () => {
    if (!videoUrl.trim()) return;

    let videoId = '';
    if (videoType === 'youtube') {
      const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      videoId = match ? match[1] : '';
    }

    socket.emit('queue:add', {
      videoType,
      videoUrl: videoType === 'youtube' ? undefined : videoUrl,
      videoId: videoType === 'youtube' ? videoId : undefined,
      title: title.trim() || undefined,
    });

    setVideoUrl('');
    setTitle('');
  };

  const handleMoveUp = (video: VideoQueueItem) => {
    if (video.order === 0) return;
    socket.emit('queue:reorder', { videoId: video.id, newOrder: video.order - 1 });
  };

  const handleMoveDown = (video: VideoQueueItem) => {
    if (video.order === videos.length - 1) return;
    socket.emit('queue:reorder', { videoId: video.id, newOrder: video.order + 1 });
  };

  const handleRemove = (video: VideoQueueItem) => {
    socket.emit('queue:remove', { videoId: video.id });
  };

  return (
    <div className="card-neon p-6 space-y-6">
      <h2 className="font-display text-3xl glow-cyan tracking-wider">
        VIDEO QUEUE ({videos.length})
      </h2>

      {/* Add Video Form */}
      <div className="space-y-4 border-t border-fg-subtle/20 pt-6">
        <div className="flex gap-2">
          {(['youtube', 'tiktok'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setVideoType(type)}
              className={`
                flex-1 py-2 px-4 rounded-lg font-semibold transition-all text-sm
                ${videoType === type ? 'btn-neon-pink' : 'bg-bg-0 text-fg-subtle'}
              `}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Video Title (optional)"
          className="input-neon text-sm"
        />

        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Paste video URL..."
          className="input-neon"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddVideo}
          disabled={!videoUrl.trim()}
          className="w-full btn-neon py-3 text-lg font-display tracking-widest disabled:opacity-50"
        >
          + ADD TO QUEUE
        </motion.button>
      </div>

      {/* Video List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {videos.length === 0 && (
          <p className="text-center text-fg-subtle py-8">
            No videos in queue. Add some above!
          </p>
        )}

        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-bg-0 rounded-lg p-4 flex items-center gap-3"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleMoveUp(video)}
                disabled={video.order === 0}
                className="text-accent-1 hover:text-accent-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ▲
              </button>
              <button
                onClick={() => handleMoveDown(video)}
                disabled={video.order === videos.length - 1}
                className="text-accent-1 hover:text-accent-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ▼
              </button>
            </div>

            <div className="flex-1">
              <p className="font-semibold text-fg-0">
                {video.title || `${video.videoType.toUpperCase()} Video`}
              </p>
              <p className="text-sm text-fg-subtle">
                Added by: {video.addedBy}
              </p>
            </div>

            <button
              onClick={() => handleRemove(video)}
              className="text-danger hover:text-danger/70 font-bold text-xl"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

