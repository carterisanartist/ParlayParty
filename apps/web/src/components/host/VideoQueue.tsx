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
  const [videoType, setVideoType] = useState<'youtube' | 'tiktok' | 'upload'>('youtube');
  const [title, setTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    socket.on('queue:updated', ({ videos: updatedVideos }) => {
      setVideos(updatedVideos.sort((a: any, b: any) => a.order - b.order));
    });

    return () => {
      socket.off('queue:updated');
    };
  }, [socket]);

  const handleAddVideo = async () => {
    if (videoType === 'upload') {
      await handleUpload();
      return;
    }
    
    if (!videoUrl.trim()) return;

    let videoId = '';
    let autoTitle = '';
    
    if (videoType === 'youtube') {
      const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      videoId = match ? match[1] : '';
      
      // ALWAYS fetch YouTube title
      if (videoId) {
        try {
          const response = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
          );
          if (response.ok) {
            const data = await response.json();
            autoTitle = data.title;
          }
        } catch (e) {
          console.error('Failed to fetch title:', e);
          autoTitle = 'YouTube Video';
        }
      }
    } else if (videoType === 'tiktok') {
      // Better TikTok URL handling - support multiple formats
      let match = videoUrl.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
      if (!match) {
        // Try vm.tiktok.com format
        match = videoUrl.match(/vm\.tiktok\.com\/([A-Za-z0-9]+)/);
      }
      if (!match) {
        // Try mobile format
        match = videoUrl.match(/tiktok\.com\/.*\/(\d+)/);
      }
      
      videoId = match ? match[1] : '';
      autoTitle = match ? `TikTok Video ${match[1]}` : 'TikTok Video';
      
      // Store full URL for TikTok since embed needs it
      if (!videoId && videoUrl.includes('tiktok.com')) {
        videoId = videoUrl; // Use full URL as ID for TikTok
        autoTitle = 'TikTok Video';
      }
    }

    socket.emit('queue:add', {
      videoType,
      videoUrl: videoType === 'youtube' ? undefined : videoUrl,
      videoId: videoType === 'youtube' ? videoId : undefined,
      title: autoTitle || undefined,
    });

    setVideoUrl('');
    setTitle('');
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video', uploadFile);
    formData.append('roundId', 'queue');

    try {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080';
      const response = await fetch(`${serverUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        socket.emit('queue:add', {
          videoType: 'upload',
          videoUrl: `${serverUrl}${data.videoUrl}`,
          title: title.trim() || uploadFile.name,
        });
        
        setUploadFile(null);
        setTitle('');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload video');
    } finally {
      setUploading(false);
    }
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
          {(['youtube', 'tiktok', 'upload'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setVideoType(type)}
              className={`
                flex-1 py-2 px-3 rounded-lg font-semibold transition-all text-xs
                ${videoType === type ? 'btn-neon-pink' : 'bg-bg-0 text-fg-subtle'}
              `}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {videoType === 'upload' && (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video Title (optional)"
            className="input-neon text-sm"
          />
        )}

        {videoType !== 'upload' ? (
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Paste video URL..."
            className="input-neon"
          />
        ) : (
          <div className="border-2 border-dashed border-accent-1 rounded-lg p-4 text-center">
            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/mov"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setUploadFile(file);
              }}
              className="hidden"
              id="queue-video-upload"
            />
            <label
              htmlFor="queue-video-upload"
              className="cursor-pointer text-sm text-accent-1 hover:text-accent-2"
            >
              {uploadFile ? uploadFile.name : '📁 Choose Video File'}
            </label>
            {uploadFile && (
              <p className="text-xs text-fg-subtle mt-1">
                {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddVideo}
          disabled={(videoType !== 'upload' && !videoUrl.trim()) || (videoType === 'upload' && !uploadFile) || uploading}
          className="w-full btn-neon py-3 text-lg font-display tracking-widest disabled:opacity-50"
        >
          {uploading ? 'UPLOADING...' : '+ ADD TO QUEUE'}
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

