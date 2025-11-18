import { logger } from '../logger';
import type { Parlay, Player } from '@parlay-party/shared';

interface SpeedScoringConfig {
  basePoints: number;
  speedBonusThresholds: {
    superFast: { time: number; bonus: number };
    fast: { time: number; bonus: number };
    normal: { time: number; bonus: number };
  };
  comboMultiplier: number;
  perfectRoundBonus: number;
}

export class SpeedScoring {
  private config: SpeedScoringConfig = {
    basePoints: 5, // Base points for correct parlays in speed mode
    speedBonusThresholds: {
      superFast: { time: 3, bonus: 3 },
      fast: { time: 5, bonus: 2 },
      normal: { time: 7, bonus: 1 }
    },
    comboMultiplier: 1.5,
    perfectRoundBonus: 10
  };

  private playerCombos: Map<string, number> = new Map();
  private roundSubmissions: Map<string, { time: number; correct: boolean }[]> = new Map();

  /**
   * Calculate speed bonus based on submission time
   */
  getSpeedBonus(submissionTime: number): number {
    const { speedBonusThresholds } = this.config;
    
    if (submissionTime <= speedBonusThresholds.superFast.time) {
      return speedBonusThresholds.superFast.bonus;
    } else if (submissionTime <= speedBonusThresholds.fast.time) {
      return speedBonusThresholds.fast.bonus;
    } else if (submissionTime <= speedBonusThresholds.normal.time) {
      return speedBonusThresholds.normal.bonus;
    }
    
    return 0;
  }

  /**
   * Track parlay submission with timing
   */
  recordSubmission(playerId: string, submissionTime: number, isCorrect: boolean): void {
    if (!this.roundSubmissions.has(playerId)) {
      this.roundSubmissions.set(playerId, []);
    }
    
    this.roundSubmissions.get(playerId)!.push({ time: submissionTime, correct: isCorrect });
    
    // Update combo
    if (isCorrect) {
      const currentCombo = this.playerCombos.get(playerId) || 0;
      this.playerCombos.set(playerId, currentCombo + 1);
    } else {
      this.playerCombos.set(playerId, 0);
    }
  }

  /**
   * Calculate total score for a speed round
   */
  calculateRoundScore(
    playerId: string,
    parlaysHit: number,
    submissionTimes: number[]
  ): { baseScore: number; speedBonus: number; comboBonus: number; total: number } {
    // Base score
    const baseScore = parlaysHit * this.config.basePoints;
    
    // Speed bonus
    const speedBonus = submissionTimes.reduce((sum, time) => sum + this.getSpeedBonus(time), 0);
    
    // Combo bonus
    const combo = this.playerCombos.get(playerId) || 0;
    const comboBonus = combo > 1 ? Math.floor((combo - 1) * this.config.comboMultiplier * this.config.basePoints) : 0;
    
    const total = baseScore + speedBonus + comboBonus;
    
    logger.info('Speed round score calculated', {
      playerId,
      baseScore,
      speedBonus,
      comboBonus,
      combo,
      total
    });
    
    return { baseScore, speedBonus, comboBonus, total };
  }

  /**
   * Check if player achieved a perfect round
   */
  isPerfectRound(playerId: string, totalParlays: number): boolean {
    const submissions = this.roundSubmissions.get(playerId) || [];
    return submissions.length === totalParlays && submissions.every(s => s.correct);
  }

  /**
   * Calculate bonus for completing all rounds
   */
  getCompletionBonus(playerId: string, roundsPlayed: number, totalRounds: number): number {
    if (roundsPlayed < totalRounds) return 0;
    
    // Base completion bonus
    let bonus = 20;
    
    // Additional bonus for high average speed
    const submissions = this.roundSubmissions.get(playerId) || [];
    const avgTime = submissions.reduce((sum, s) => sum + s.time, 0) / submissions.length;
    
    if (avgTime <= 5) {
      bonus += 30; // Lightning fast average
    } else if (avgTime <= 7) {
      bonus += 15; // Fast average
    }
    
    return bonus;
  }

  /**
   * Get leaderboard data for speed mode
   */
  getLeaderboard(players: Player[]): Array<{
    player: Player;
    score: number;
    avgSpeed: number;
    combo: number;
    perfectRounds: number;
  }> {
    return players
      .filter(p => !p.isHost)
      .map(player => {
        const submissions = this.roundSubmissions.get(player.id) || [];
        const avgSpeed = submissions.length > 0
          ? submissions.reduce((sum, s) => sum + s.time, 0) / submissions.length
          : 999;
        
        const perfectRounds = this.countPerfectRounds(player.id);
        
        return {
          player,
          score: player.scoreTotal,
          avgSpeed,
          combo: this.playerCombos.get(player.id) || 0,
          perfectRounds
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Count perfect rounds for a player
   */
  private countPerfectRounds(playerId: string): number {
    // This would need to track rounds properly in production
    // For now, simplified implementation
    return 0;
  }

  /**
   * Reset scoring for new game
   */
  reset(): void {
    this.playerCombos.clear();
    this.roundSubmissions.clear();
  }

  /**
   * Get speed mode statistics
   */
  getStats(playerId: string): {
    totalSubmissions: number;
    averageSpeed: number;
    fastestSubmission: number;
    currentCombo: number;
    speedBonusEarned: number;
  } {
    const submissions = this.roundSubmissions.get(playerId) || [];
    
    if (submissions.length === 0) {
      return {
        totalSubmissions: 0,
        averageSpeed: 0,
        fastestSubmission: 0,
        currentCombo: 0,
        speedBonusEarned: 0
      };
    }
    
    const times = submissions.map(s => s.time);
    const averageSpeed = times.reduce((sum, t) => sum + t, 0) / times.length;
    const fastestSubmission = Math.min(...times);
    const speedBonusEarned = times.reduce((sum, t) => sum + this.getSpeedBonus(t), 0);
    
    return {
      totalSubmissions: submissions.length,
      averageSpeed,
      fastestSubmission,
      currentCombo: this.playerCombos.get(playerId) || 0,
      speedBonusEarned
    };
  }
}

// Export singleton instance
export const speedScoring = new SpeedScoring();
