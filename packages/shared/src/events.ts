import { Player, Room, Round, Parlay, Marker, ConfirmedEvent, WheelEntry, PunishmentSpin, ScoreUpdate, VoteCluster } from './types';

export interface ServerToClientEvents {
  'roster:update': (data: { players: Player[] }) => void;
  'room:update': (data: { room: Room }) => void;
  'round:started': (data: { round: Round }) => void;
  'round:status': (data: { status: string }) => void;
  'parlay:progress': (data: { playerId: string; submitted: boolean }) => void;
  'parlay:locked': () => void;
  'video:play': () => void;
  'video:pause': () => void;
  'video:pause_auto': (data: { tCenter: number; normalizedText: string; voters: string[] }) => void;
  'video:seek': (data: { tVideoSec: number }) => void;
  'video:resume': () => void;
  'marker:added': (data: { marker: Marker }) => void;
  'event:confirmed': (data: { event: ConfirmedEvent }) => void;
  'scoreboard:update': (data: { scores: ScoreUpdate[] }) => void;
  'review:markers': (data: { markers: Marker[] }) => void;
  'wheel:entry_added': (data: { entry: WheelEntry }) => void;
  'wheel:entry_moderated': (data: { entryId: string; status: string }) => void;
  'wheel:locked': () => void;
  'wheel:spinning': (data: { commitSeed: string }) => void;
  'wheel:result': (data: { selectedEntry: WheelEntry; loser: Player; spin: PunishmentSpin }) => void;
  'wheel:complete': () => void;
  'player:joined': (data: { player: Player }) => void;
  'error': (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  'player:join': (data: { name: string; avatarUrl?: string }, callback: (response: { player: Player; room: Room; round?: Round }) => void) => void;
  'host:startRound': (data: { videoType: string; videoUrl?: string; videoId?: string }) => void;
  'parlay:submit': (data: { text: string }) => void;
  'parlay:lock': () => void;
  'vote:add': (data: { tVideoSec: number }) => void;
  'host:confirmEvent': (data: { tCenter: number; normalizedText: string }) => void;
  'host:dismissEvent': (data: { tCenter: number; normalizedText: string }) => void;
  'host:mark': (data: { tVideoSec: number; note?: string }) => void;
  'host:play': () => void;
  'host:pause': () => void;
  'host:seek': (data: { tVideoSec: number }) => void;
  'host:sync': (data: { tVideoSec: number }) => void;
  'host:endRound': () => void;
  'review:list': (callback: (response: { markers: Marker[] }) => void) => void;
  'review:confirm': (data: { markerId?: string; tVideoSec?: number; normalizedText: string }) => void;
  'wheel:submit': (data: { text: string }) => void;
  'wheel:moderate': (data: { entryId: string; status: string }) => void;
  'wheel:lock': () => void;
  'wheel:spin': () => void;
  'wheel:complete': () => void;
  'ping': (callback: (response: number) => void) => void;
}

