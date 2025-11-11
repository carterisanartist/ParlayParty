import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@parlay-party/shared';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useSocket(roomCode: string) {
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<TypedSocket | null>(null);

  useEffect(() => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080';
    
    const newSocket: TypedSocket = io(serverUrl, {
      query: { roomCode },
      transports: ['websocket', 'polling'],
      forceNew: true, // Force new connection to avoid stale state
    });

    newSocket.on('connect', () => {
      console.log('Socket connected to room:', roomCode);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });


    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomCode]);

  return { socket, connected };
}

export function measureLatency(socket: TypedSocket): Promise<number> {
  return new Promise((resolve) => {
    const start = Date.now();
    socket.emit('ping', (response) => {
      const latency = Date.now() - start;
      resolve(latency);
    });
  });
}

