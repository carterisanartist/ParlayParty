import redis from './redis';
import { logger } from './logger';

export class CacheManager {
  private readonly defaultTTL = 300; // 5 minutes

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const ttl = ttlSeconds || this.defaultTTL;
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache set error', { key, error });
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Cache delete error', { key, error });
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache pattern invalidation error', { pattern, error });
    }
  }

  // Specific cache methods for game data
  async getRoomState(roomCode: string) {
    return this.get(`room:${roomCode}:state`);
  }

  async setRoomState(roomCode: string, state: any) {
    return this.set(`room:${roomCode}:state`, state, 60); // 1 minute TTL for room state
  }

  async getPlayerParlays(roundId: string) {
    return this.get(`round:${roundId}:parlays`);
  }

  async setPlayerParlays(roundId: string, parlays: any[]) {
    return this.set(`round:${roundId}:parlays`, parlays, 300); // 5 minutes TTL
  }

  async invalidateRoom(roomCode: string) {
    return this.invalidatePattern(`room:${roomCode}:*`);
  }
}

export const cacheManager = new CacheManager();
