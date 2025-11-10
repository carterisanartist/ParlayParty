import { VoteCluster } from '@parlay-party/shared';

export interface VoteData {
  playerId: string;
  normalizedText: string;
  tVideoSec: number;
  createdAt: Date;
}

export function clusterVotes(
  votes: VoteData[],
  timeWindowSec: number = 2.5
): VoteCluster[] {
  const clusters: VoteCluster[] = [];
  const processed = new Set<string>();
  
  const sortedVotes = [...votes].sort((a, b) => a.tVideoSec - b.tVideoSec);
  
  for (const vote of sortedVotes) {
    const voteKey = `${vote.playerId}-${vote.normalizedText}-${vote.tVideoSec}`;
    if (processed.has(voteKey)) continue;
    
    const similarVotes = sortedVotes.filter(v => {
      if (v.normalizedText !== vote.normalizedText) return false;
      const timeDiff = Math.abs(v.tVideoSec - vote.tVideoSec);
      return timeDiff <= timeWindowSec;
    });
    
    if (similarVotes.length === 0) continue;
    
    const uniqueVoters = new Set(similarVotes.map(v => v.playerId));
    const times = similarVotes.map(v => v.tVideoSec);
    const tMin = Math.min(...times);
    const tMax = Math.max(...times);
    const tCenter = times.reduce((sum, t) => sum + t, 0) / times.length;
    
    clusters.push({
      normalizedText: vote.normalizedText,
      voters: Array.from(uniqueVoters),
      tCenter,
      tMin,
      tMax,
      count: uniqueVoters.size,
    });
    
    similarVotes.forEach(v => {
      const key = `${v.playerId}-${v.normalizedText}-${v.tVideoSec}`;
      processed.add(key);
    });
  }
  
  clusters.sort((a, b) => b.count - a.count);
  
  return clusters;
}

export function shouldAutoPause(
  cluster: VoteCluster,
  totalPlayers: number,
  consensusThresholdPct: number,
  minVotes: number
): boolean {
  const requiredVotes = Math.max(minVotes, Math.ceil(totalPlayers * consensusThresholdPct));
  return cluster.count >= requiredVotes;
}

export function checkTwoPlayerConsensus(
  votes: VoteData[],
  mode: string,
  playerCount: number
): VoteCluster | null {
  if (playerCount !== 2) return null;
  
  const recentVotes = votes.filter(v => {
    const age = Date.now() - v.createdAt.getTime();
    return age <= 3000;
  });
  
  const clusters = clusterVotes(recentVotes, 1.5);
  
  for (const cluster of clusters) {
    switch (mode) {
      case 'unanimous':
        if (cluster.count === 2) return cluster;
        break;
        
      case 'single_caller_verify':
        if (cluster.count === 2) return cluster;
        break;
        
      case 'judge_mode':
        if (cluster.count >= 1) return cluster;
        break;
        
      case 'speed_call':
        if (cluster.count >= 1) return cluster;
        break;
    }
  }
  
  return null;
}

