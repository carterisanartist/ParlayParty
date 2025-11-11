export type RoomStatus = 'lobby' | 'parlay' | 'video' | 'review' | 'wheel' | 'results' | 'ended';
export type RoundStatus = 'pending' | 'parlay' | 'video' | 'review' | 'wheel' | 'completed';
export type VideoType = 'youtube' | 'upload' | 'tiktok';
export type TwoPlayerMode = 'unanimous' | 'single_caller_verify' | 'judge_mode' | 'speed_call';
export type WheelEntryStatus = 'pending' | 'approved' | 'rejected';
export type EventSource = 'consensus' | 'host_review';

export interface RoomSettings {
  voteWindowSec: number;
  consensusThresholdPct: number;
  minVotes: number;
  cooldownPerTextSec: number;
  fastTapWindow: number;
  twoPlayerMode: TwoPlayerMode;
  scoreMultiplier: number;
  pauseDurationSec: number;
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  voteWindowSec: 3,
  consensusThresholdPct: 0.5,
  minVotes: 1,
  cooldownPerTextSec: 6,
  fastTapWindow: 1.0,
  twoPlayerMode: 'unanimous',
  scoreMultiplier: 3.0,
  pauseDurationSec: 20,
};

export interface Player {
  id: string;
  roomId: string;
  name: string;
  avatarUrl?: string;
  isHost: boolean;
  latencyMs: number;
  scoreTotal: number;
  createdAt: Date;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  status: RoomStatus;
  settings: RoomSettings;
  createdAt: Date;
}

export interface Round {
  id: string;
  roomId: string;
  index: number;
  videoType: VideoType;
  videoId?: string;
  videoUrl?: string;
  videoTitle?: string;
  durationSec?: number;
  status: RoundStatus;
  createdAt: Date;
}

export interface VideoQueueItem {
  id: string;
  roomId: string;
  videoType: VideoType;
  videoId?: string;
  videoUrl?: string;
  title?: string;
  addedBy: string;
  order: number;
  createdAt: Date;
}

export interface Parlay {
  id: string;
  roundId: string;
  playerId: string;
  text: string;
  normalizedText: string;
  punishment?: string;
  frequency: 'once' | 'multiple';
  isUsed: boolean;
  lockedAt: Date;
  completedAt?: Date;
  scoreRaw: number;
  scoreFinal: number;
  legsHit: number;
  accuracy: number;
}

export interface Vote {
  id: string;
  roundId: string;
  playerId: string;
  normalizedText: string;
  tVideoSec: number;
  createdAt: Date;
}

export interface Marker {
  id: string;
  roundId: string;
  hostId: string;
  tVideoSec: number;
  note?: string;
}

export interface ConfirmedEvent {
  id: string;
  roundId: string;
  normalizedText: string;
  tVideoSec: number;
  source: EventSource;
  awardedTo: string[];
  createdAt: Date;
}

export interface WheelEntry {
  id: string;
  roundId: string;
  submittedByPlayerId: string;
  text: string;
  status: WheelEntryStatus;
  weight: number;
  createdAt: Date;
}

export interface PunishmentSpin {
  id: string;
  roundId: string;
  loserPlayerId: string;
  selectedEntryId: string;
  entriesJson: WheelEntry[];
  createdAt: Date;
}

export interface VoteCluster {
  normalizedText: string;
  voters: string[];
  tCenter: number;
  tMin: number;
  tMax: number;
  count: number;
}

export interface EventStats {
  normalizedText: string;
  hits: number;
  uniquePlayers: Set<string>;
}

export interface ScoreUpdate {
  playerId: string;
  parlayId: string;
  delta: number;
  newTotal: number;
  reason: string;
}

