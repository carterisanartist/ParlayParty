'use client';

import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';

interface TylerSoundPlayerProps {
  socket: Socket;
}

export function TylerSoundPlayer({ socket }: TylerSoundPlayerProps) {
  useEffect(() => {
    socket.on('tyler:sound', () => {
      console.log('🎵 Playing Tyler sound!');
      
      try {
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080';
        const audio = new Audio(`${serverUrl}/tyler-sound`);
        audio.volume = 0.5;
        audio.play().catch(console.error);
        
        // Show notification
        const notification = document.createElement('div');
        notification.textContent = '🎵 TYLER HAS ENTERED THE BUILDING!';
        notification.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(45deg, #FF2D95, #00FFF7);
          color: white;
          padding: 20px 40px;
          border-radius: 12px;
          font-weight: bold;
          font-size: 24px;
          z-index: 9999;
          box-shadow: 0 0 30px rgba(255, 45, 149, 0.8);
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      } catch (error) {
        console.error('Error playing Tyler sound:', error);
      }
    });

    return () => {
      socket.off('tyler:sound');
    };
  }, [socket]);

  return null; // No UI, just audio logic
}
