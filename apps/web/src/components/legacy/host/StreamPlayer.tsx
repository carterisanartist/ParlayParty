'use client';

import { useEffect, useRef, useState } from 'react';
import type { StreamPlatform } from '@parlay-party/shared';

interface StreamPlayerProps {
  streamUrl: string;
  platform: StreamPlatform;
  onReady?: () => void;
  onError?: (error: string) => void;
}

export function StreamPlayer({ streamUrl, platform, onReady, onError }: StreamPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [embedUrl, setEmbedUrl] = useState<string>('');

  useEffect(() => {
    // Generate embed URL based on platform
    try {
      const url = new URL(streamUrl);
      const pathParts = url.pathname.split('/').filter(p => p);
      
      if (pathParts.length === 0) {
        onError?.('Invalid stream URL');
        return;
      }

      const channel = pathParts[0];
      
      if (platform === 'twitch') {
        // Twitch embed
        const params = new URLSearchParams({
          channel,
          parent: window.location.hostname,
          autoplay: 'true',
          muted: 'false'
        });
        setEmbedUrl(`https://player.twitch.tv/?${params.toString()}`);
      } else if (platform === 'kick') {
        // Kick embed
        setEmbedUrl(`https://player.kick.com/${channel}`);
      }
      
      setIsLoading(false);
    } catch (error) {
      onError?.('Failed to generate embed URL');
      setIsLoading(false);
    }
  }, [streamUrl, platform, onError]);

  const handleIframeLoad = () => {
    onReady?.();
  };

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-0">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-3 border-t-transparent mx-auto" />
            <p className="text-fg-subtle">Loading stream...</p>
          </div>
        </div>
      )}
      
      {embedUrl && (
        <>
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen"
            onLoad={handleIframeLoad}
            style={{ border: 'none' }}
          />
          
          {/* Platform indicator */}
          <div className="absolute top-4 left-4 bg-bg-0/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center space-x-2">
            {platform === 'twitch' && (
              <>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-purple-400">Twitch Live</span>
              </>
            )}
            {platform === 'kick' && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-green-400">Kick Live</span>
              </>
            )}
          </div>

          {/* Delay warning */}
          <div className="absolute bottom-4 right-4 bg-bg-0/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-warning">
            ⏱️ {platform === 'twitch' ? '~10s' : '~7s'} delay
          </div>
        </>
      )}
    </div>
  );
}
