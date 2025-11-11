// Comprehensive API and Response Types
import type { Player, Room, Round, Parlay, VideoQueueItem, RoomStatus } from './types';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PlayerJoinResponse {
  player: Player;
  room: Room;
  round?: Round;
  parlays?: ParleyResponseItem[];
}

export interface PlayerJoinErrorResponse {
  error: string;
}

export interface ParleyResponseItem {
  id: string;
  text: string;
  normalizedText: string;
  playerId: string;
}

export interface VideoPlayerRef {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getPlayerState: () => number;
}

export interface SocketEventHandlers {
  'host:sync': (data: { tVideoSec: number }) => void;
  'parlay:all': (data: { parlays: ParleyResponseItem[] }) => void;
  'video:play': () => void;
  'video:pause': () => void;
  'room:update': (data: { room: Room }) => void;
  'round:started': (data: { round: Round }) => void;
  'round:status': (data: { status: string }) => void;
  'parlay:locked': () => void;
  'tyler:sound': () => void;
}

export interface CustomEventDetail {
  parlays: ParleyResponseItem[];
}

export interface GameMetrics {
  activeConnections: number;
  totalRooms: number;
  activeGames: number;
  totalVotes: number;
  averageLatency: number;
  errorCount: number;
}

// Re-export shared types
export type { Player, Room, Round, Parlay, VideoQueueItem, RoomStatus };
