import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { WebRTCManager, WebRTCMessage } from '@/lib/webrtc';

interface UseWebRTCOptions {
  socket: Socket | null;
  roomCode: string;
  isHost: boolean;
  onParlayCalled?: (parlayId: string, callerId: string) => void;
  onVoteUpdate?: (votes: any, from: string) => void;
  onReaction?: (reaction: string, from: string) => void;
}

export function useWebRTC({
  socket,
  roomCode,
  isHost,
  onParlayCalled,
  onVoteUpdate,
  onReaction
}: UseWebRTCOptions) {
  const webrtcManager = useRef<WebRTCManager | null>(null);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [latency, setLatency] = useState<number | null>(null);
  
  useEffect(() => {
    if (!socket || !socket.connected) return;
    
    // Initialize WebRTC manager
    webrtcManager.current = new WebRTCManager(socket, roomCode, isHost);
    
    // Handle WebRTC events
    socket.on('webrtc:parlay-called', ({ from, parlayId }) => {
      if (onParlayCalled) {
        onParlayCalled(parlayId, from);
      }
    });
    
    socket.on('webrtc:vote-update', ({ from, votes }) => {
      if (onVoteUpdate) {
        onVoteUpdate(votes, from);
      }
    });
    
    socket.on('webrtc:reaction', ({ from, reaction }) => {
      if (onReaction) {
        onReaction(reaction, from);
      }
    });
    
    // If host, initiate connections to all players
    if (isHost) {
      socket.on('player:joined', ({ player }) => {
        if (player.id !== socket.id) {
          webrtcManager.current?.initiateConnection(player.id);
        }
      });
    }
    
    // Measure latency periodically
    const latencyInterval = setInterval(() => {
      if (webrtcManager.current) {
        webrtcManager.current.sendMessage({
          type: 'sync-time',
          data: {},
          timestamp: Date.now()
        });
      }
    }, 5000);
    
    return () => {
      clearInterval(latencyInterval);
      webrtcManager.current?.destroy();
      socket.off('webrtc:parlay-called');
      socket.off('webrtc:vote-update');
      socket.off('webrtc:reaction');
      if (isHost) {
        socket.off('player:joined');
      }
    };
  }, [socket, roomCode, isHost, onParlayCalled, onVoteUpdate, onReaction]);
  
  const sendParlayCalled = (parlayId: string) => {
    if (webrtcManager.current) {
      webrtcManager.current.sendMessage({
        type: 'parlay-called',
        data: { parlayId },
        timestamp: Date.now()
      });
    }
  };
  
  const sendVoteUpdate = (votes: any) => {
    if (webrtcManager.current) {
      webrtcManager.current.sendMessage({
        type: 'vote-update',
        data: { votes },
        timestamp: Date.now()
      });
    }
  };
  
  const sendReaction = (reaction: string) => {
    if (webrtcManager.current) {
      webrtcManager.current.sendMessage({
        type: 'reaction',
        data: { reaction },
        timestamp: Date.now()
      });
    }
  };
  
  return {
    connectedPeers,
    latency,
    sendParlayCalled,
    sendVoteUpdate,
    sendReaction
  };
}
