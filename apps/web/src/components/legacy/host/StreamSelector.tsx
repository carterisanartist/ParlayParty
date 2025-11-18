'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Socket } from 'socket.io-client';

interface StreamSelectorProps {
  socket: Socket;
  onStreamSelected: (videoType: string, streamUrl: string, streamPlatform?: string) => void;
}

export function StreamSelector({ socket, onStreamSelected }: StreamSelectorProps) {
  const [showStreamInput, setShowStreamInput] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  const handleStreamSubmit = async () => {
    if (!streamUrl.trim()) {
      setError('Please enter a stream URL');
      return;
    }

    setValidating(true);
    setError('');

    try {
      // Detect platform from URL
      const url = streamUrl.toLowerCase();
      let platform: 'twitch' | 'kick' | null = null;
      
      if (url.includes('twitch.tv')) {
        platform = 'twitch';
      } else if (url.includes('kick.com')) {
        platform = 'kick';
      }

      if (!platform) {
        setError('Please enter a valid Twitch or Kick stream URL');
        setValidating(false);
        return;
      }

      // Extract channel name
      const urlParts = new URL(streamUrl);
      const pathParts = urlParts.pathname.split('/').filter(p => p);
      
      if (pathParts.length === 0) {
        setError('Invalid stream URL - no channel found');
        setValidating(false);
        return;
      }

      const channel = pathParts[0];

      // TODO: Validate stream with server
      // For now, we'll accept any properly formatted URL
      
      onStreamSelected(platform, streamUrl, platform);
      setStreamUrl('');
      setShowStreamInput(false);
    } catch (e) {
      setError('Invalid URL format');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-4">
      {!showStreamInput ? (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowStreamInput(true)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <div className="flex items-center justify-center space-x-3">
            <span className="text-2xl">📺</span>
            <span className="text-lg">Add Live Stream</span>
            <span className="text-sm bg-white/20 px-2 py-1 rounded">Twitch/Kick</span>
          </div>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-neon p-6 space-y-4"
        >
          <h3 className="font-display text-2xl glow-violet mb-4 text-center">
            ADD LIVE STREAM
          </h3>

          <div className="space-y-4">
            <div className="flex space-x-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-1 text-center p-3 bg-purple-600/20 rounded-lg border-2 border-purple-600"
              >
                <div className="text-3xl mb-1">🟪</div>
                <div className="font-semibold">Twitch</div>
                <div className="text-xs text-fg-subtle">twitch.tv/channel</div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-1 text-center p-3 bg-green-600/20 rounded-lg border-2 border-green-600"
              >
                <div className="text-3xl mb-1">🟩</div>
                <div className="font-semibold">Kick</div>
                <div className="text-xs text-fg-subtle">kick.com/channel</div>
              </motion.div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Paste stream URL (e.g., twitch.tv/pokimane)"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStreamSubmit()}
                className="input-neon w-full"
                disabled={validating}
              />
              
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-danger text-sm mt-2"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <div className="bg-bg-0/50 rounded-lg p-3 text-sm text-fg-subtle">
              <p className="font-semibold mb-1">📝 Note about stream delays:</p>
              <p>• Twitch: ~10 second delay</p>
              <p>• Kick: ~7 second delay</p>
              <p>• Players' calls will be synced with the delay</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleStreamSubmit}
                disabled={validating || !streamUrl.trim()}
                className="flex-1 btn-neon-violet py-3 disabled:opacity-50"
              >
                {validating ? 'Validating...' : 'Add Stream'}
              </button>
              
              <button
                onClick={() => {
                  setShowStreamInput(false);
                  setStreamUrl('');
                  setError('');
                }}
                className="px-6 py-3 bg-danger/20 border-2 border-danger text-danger rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
