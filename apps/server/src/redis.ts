import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

export default redis;

export interface EventStatsData {
  normalizedText: string;
  hits: number;
  uniquePlayers: string[];
}

export async function getEventStats(roundId: string): Promise<Map<string, EventStatsData>> {
  const key = `round:${roundId}:stats`;
  const data = await redis.hgetall(key);
  const stats = new Map<string, EventStatsData>();
  
  for (const [normalizedText, jsonStr] of Object.entries(data)) {
    try {
      const parsed = JSON.parse(jsonStr);
      stats.set(normalizedText, parsed);
    } catch (e) {
      console.error('Failed to parse event stats:', e);
    }
  }
  
  return stats;
}

export async function updateEventStats(
  roundId: string,
  normalizedText: string,
  playerId: string
): Promise<EventStatsData> {
  const key = `round:${roundId}:stats`;
  const existingJson = await redis.hget(key, normalizedText);
  
  let stats: EventStatsData;
  if (existingJson) {
    stats = JSON.parse(existingJson);
    if (!stats.uniquePlayers.includes(playerId)) {
      stats.uniquePlayers.push(playerId);
    }
    stats.hits++;
  } else {
    stats = {
      normalizedText,
      hits: 1,
      uniquePlayers: [playerId],
    };
  }
  
  await redis.hset(key, normalizedText, JSON.stringify(stats));
  return stats;
}

export async function clearRoundStats(roundId: string): Promise<void> {
  const key = `round:${roundId}:stats`;
  await redis.del(key);
}

