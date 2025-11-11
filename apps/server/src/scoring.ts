import { calculateRarityWeight, calculateScore } from '@parlay-party/shared';
import { getEventStats, updateEventStats, EventStatsData } from './redis';

export interface ScoreCalculation {
  weight: number;
  baseScore: number;
  completionBonus: number;
  fastTapBonus: number;
  totalScore: number;
}

export async function calculateEventScore(
  roundId: string,
  normalizedText: string,
  playerId: string,
  multiplier: number,
  fastTap: boolean = false
): Promise<ScoreCalculation> {
  const stats = await getEventStats(roundId);
  await updateEventStats(roundId, normalizedText, playerId);
  
  let totalHits = 0;
  let textHits = 0;
  
  for (const [text, data] of stats.entries()) {
    totalHits += data.hits;
    if (text === normalizedText) {
      textHits = data.hits;
    }
  }
  
  textHits++;
  totalHits++;
  
  const mockParlays = Array(totalHits).fill(null).map((_, i) => ({
    normalizedText: i < textHits ? normalizedText : 'other'
  }));
  const weight = calculateRarityWeight(normalizedText, mockParlays);
  const baseScore = weight * 1.0;
  const completionBonus = baseScore * (multiplier - 1);
  const fastTapBonus = fastTap ? 0.25 : 0;
  const totalScore = baseScore + completionBonus + fastTapBonus;
  
  return {
    weight,
    baseScore,
    completionBonus,
    fastTapBonus,
    totalScore,
  };
}

export function determineLoser(
  parlays: Array<{
    playerId: string;
    scoreFinal: number;
    legsHit: number;
    accuracy: number;
    completedAt?: Date;
  }>
): string | null {
  if (parlays.length === 0) return null;
  
  let losers = [...parlays];
  
  losers.sort((a, b) => {
    if (a.scoreFinal !== b.scoreFinal) return a.scoreFinal - b.scoreFinal;
    if (a.legsHit !== b.legsHit) return a.legsHit - b.legsHit;
    if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
    
    const aTime = a.completedAt?.getTime() || Infinity;
    const bTime = b.completedAt?.getTime() || Infinity;
    return bTime - aTime;
  });
  
  const lowestScore = losers[0].scoreFinal;
  const tiedLosers = losers.filter(p => p.scoreFinal === lowestScore);
  
  if (tiedLosers.length === 1) {
    return tiedLosers[0].playerId;
  }
  
  const randomIndex = Math.floor(Math.random() * tiedLosers.length);
  return tiedLosers[randomIndex].playerId;
}

