export function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function generateRoomCode(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function calculateRarityWeight(totalHits: number, textHits: number, K: number = 10): number {
  return 1 + Math.log((totalHits + K) / (textHits + 1));
}

export function calculateScore(
  weight: number,
  legsHit: number,
  multiplier: number,
  fastTap: boolean = false
): number {
  const baseScore = weight * legsHit;
  const completionBonus = baseScore * (multiplier - 1);
  const fastTapBonus = fastTap ? 0.25 : 0;
  return baseScore + completionBonus + fastTapBonus;
}

export function selectWeightedRandom<T extends { weight: number }>(
  items: T[],
  seed: string
): T | null {
  if (items.length === 0) return null;

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  
  const random = Math.abs(hash % 10000) / 10000;
  let threshold = random * totalWeight;
  
  for (const item of items) {
    threshold -= item.weight;
    if (threshold <= 0) {
      return item;
    }
  }
  
  return items[items.length - 1];
}

export function createCommitSeed(roomId: string, roundId: string, salt: string): string {
  let crypto: any = null;
  try {
    crypto = require('crypto');
  } catch (e) {
    // Crypto not available in browser
  }
  
  const data = `${roomId}|${roundId}|${salt}|${Date.now()}`;
  
  if (crypto && crypto.createHash) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  // Fallback hash for browsers
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function determineTwoPlayerThreshold(mode: string): number {
  switch (mode) {
    case 'unanimous':
      return 2;
    case 'single_caller_verify':
      return 1;
    case 'judge_mode':
      return 1;
    case 'speed_call':
      return 1;
    default:
      return 2;
  }
}

