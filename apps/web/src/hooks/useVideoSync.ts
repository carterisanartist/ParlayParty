import { useRef, useCallback } from 'react';
import type { VideoPlayerRef } from '@parlay-party/shared';

export function useVideoSync() {
  const videoTimeRef = useRef(0);

  const syncWithHost = useCallback((tVideoSec: number, videoPlayer: VideoPlayerRef | null) => {
    videoTimeRef.current = tVideoSec;
    
    if (videoPlayer) {
      const currentTime = videoPlayer.getCurrentTime();
      const timeDiff = Math.abs(currentTime - tVideoSec);
      
      // Only sync if difference is significant (>2 seconds)
      if (timeDiff > 2) {
        console.log('📱 Syncing mobile video', { currentTime, hostTime: tVideoSec });
        videoPlayer.seekTo(tVideoSec, true);
      }
    }
  }, []);

  const getCurrentTime = useCallback(() => {
    return videoTimeRef.current;
  }, []);

  return {
    videoTimeRef,
    syncWithHost,
    getCurrentTime,
  };
}
