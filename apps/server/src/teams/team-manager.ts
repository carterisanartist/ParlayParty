import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import type { Player } from '@parlay-party/shared';

export interface Team {
  id: string;
  name: string;
  color: string;
  gradient: string;
  emoji: string;
  players: Player[];
  totalScore: number;
}

export interface TeamScore {
  teamId: string;
  baseScore: number;
  bonusScore: number;
  totalScore: number;
  mvpPlayerId?: string;
}

interface TeamChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}

export class TeamManager {
  private teams: Map<string, Map<string, Team>> = new Map(); // roomId -> teamId -> Team
  private playerTeams: Map<string, { roomId: string; teamId: string }> = new Map(); // playerId -> team info
  private teamChats: Map<string, TeamChatMessage[]> = new Map(); // teamChatId -> messages
  private teamScores: Map<string, TeamScore> = new Map(); // teamId -> score

  /**
   * Initialize teams for a room
   */
  initializeTeams(roomId: string, teams: Team[]): void {
    const roomTeams = new Map<string, Team>();
    
    teams.forEach(team => {
      roomTeams.set(team.id, team);
      
      // Map players to teams
      team.players.forEach(player => {
        this.playerTeams.set(player.id, { roomId, teamId: team.id });
      });
      
      // Initialize team score
      this.teamScores.set(team.id, {
        teamId: team.id,
        baseScore: 0,
        bonusScore: 0,
        totalScore: 0
      });
      
      // Initialize team chat
      const chatId = `${roomId}-${team.id}`;
      this.teamChats.set(chatId, []);
    });
    
    this.teams.set(roomId, roomTeams);
    logger.info('Teams initialized', { roomId, teamCount: teams.length });
  }

  /**
   * Get team for a player
   */
  getPlayerTeam(playerId: string): Team | null {
    const teamInfo = this.playerTeams.get(playerId);
    if (!teamInfo) return null;
    
    const roomTeams = this.teams.get(teamInfo.roomId);
    if (!roomTeams) return null;
    
    return roomTeams.get(teamInfo.teamId) || null;
  }

  /**
   * Get all teams for a room
   */
  getRoomTeams(roomId: string): Team[] {
    const roomTeams = this.teams.get(roomId);
    if (!roomTeams) return [];
    
    return Array.from(roomTeams.values());
  }

  /**
   * Add score to a team (when any member scores)
   */
  addTeamScore(playerId: string, points: number, isBonus: boolean = false): TeamScore | null {
    const teamInfo = this.playerTeams.get(playerId);
    if (!teamInfo) return null;
    
    const score = this.teamScores.get(teamInfo.teamId);
    if (!score) return null;
    
    if (isBonus) {
      score.bonusScore += points;
    } else {
      score.baseScore += points;
    }
    
    score.totalScore = score.baseScore + score.bonusScore;
    
    // Update team's total score
    const roomTeams = this.teams.get(teamInfo.roomId);
    if (roomTeams) {
      const team = roomTeams.get(teamInfo.teamId);
      if (team) {
        team.totalScore = score.totalScore;
      }
    }
    
    logger.info('Team score updated', { 
      teamId: teamInfo.teamId, 
      playerId,
      points,
      newTotal: score.totalScore 
    });
    
    return score;
  }

  /**
   * Get team scores for ranking
   */
  getTeamScores(roomId: string): TeamScore[] {
    const roomTeams = this.teams.get(roomId);
    if (!roomTeams) return [];
    
    return Array.from(roomTeams.keys())
      .map(teamId => this.teamScores.get(teamId))
      .filter((score): score is TeamScore => score !== undefined)
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Calculate MVP for each team
   */
  calculateMVPs(roomId: string, playerScores: Map<string, number>): void {
    const roomTeams = this.teams.get(roomId);
    if (!roomTeams) return;
    
    roomTeams.forEach(team => {
      let mvpId: string | undefined;
      let mvpScore = 0;
      
      team.players.forEach(player => {
        const score = playerScores.get(player.id) || 0;
        if (score > mvpScore) {
          mvpScore = score;
          mvpId = player.id;
        }
      });
      
      const teamScore = this.teamScores.get(team.id);
      if (teamScore && mvpId) {
        teamScore.mvpPlayerId = mvpId;
      }
    });
  }

  /**
   * Add message to team chat
   */
  addTeamMessage(roomId: string, teamId: string, message: TeamChatMessage): TeamChatMessage[] {
    const chatId = `${roomId}-${teamId}`;
    const messages = this.teamChats.get(chatId) || [];
    
    messages.push(message);
    
    // Keep only last 100 messages
    if (messages.length > 100) {
      messages.splice(0, messages.length - 100);
    }
    
    this.teamChats.set(chatId, messages);
    return messages;
  }

  /**
   * Get team chat messages
   */
  getTeamMessages(roomId: string, teamId: string): TeamChatMessage[] {
    const chatId = `${roomId}-${teamId}`;
    return this.teamChats.get(chatId) || [];
  }

  /**
   * Get team members in a room
   */
  getTeamMembers(roomId: string, teamId: string): Player[] {
    const roomTeams = this.teams.get(roomId);
    if (!roomTeams) return [];
    
    const team = roomTeams.get(teamId);
    return team ? team.players : [];
  }

  /**
   * Clean up team data for a room
   */
  cleanupRoom(roomId: string): void {
    const roomTeams = this.teams.get(roomId);
    if (roomTeams) {
      // Clean up player mappings
      roomTeams.forEach(team => {
        team.players.forEach(player => {
          this.playerTeams.delete(player.id);
        });
        
        // Clean up team scores
        this.teamScores.delete(team.id);
        
        // Clean up team chat
        const chatId = `${roomId}-${team.id}`;
        this.teamChats.delete(chatId);
      });
      
      // Remove room teams
      this.teams.delete(roomId);
    }
    
    logger.info('Team data cleaned up', { roomId });
  }

  /**
   * Get team cooperation bonus
   * Teams get bonus points for synchronized actions
   */
  calculateCooperationBonus(teamId: string, actionTimestamps: number[]): number {
    if (actionTimestamps.length < 2) return 0;
    
    // Sort timestamps
    const sorted = actionTimestamps.sort((a, b) => a - b);
    
    // Calculate time differences
    const diffs: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      diffs.push(sorted[i] - sorted[i - 1]);
    }
    
    // Award bonus for actions within 2 seconds of each other
    const syncBonus = diffs.filter(diff => diff <= 2000).length * 2;
    
    return syncBonus;
  }

  /**
   * Award team achievements
   */
  checkTeamAchievements(teamId: string, roomId: string): string[] {
    const achievements: string[] = [];
    const score = this.teamScores.get(teamId);
    const team = this.teams.get(roomId)?.get(teamId);
    
    if (!score || !team) return achievements;
    
    // Perfect synchronization achievement
    if (score.bonusScore > 20) {
      achievements.push('Perfect Sync');
    }
    
    // Domination achievement
    const allScores = this.getTeamScores(roomId);
    if (allScores.length > 1 && allScores[0].teamId === teamId) {
      const leadMargin = allScores[0].totalScore - allScores[1].totalScore;
      if (leadMargin > 50) {
        achievements.push('Total Domination');
      }
    }
    
    // Unity achievement (all members scored)
    const messages = this.getTeamMessages(roomId, teamId);
    const activeMembers = new Set(messages.map(m => m.playerId));
    if (activeMembers.size === team.players.length) {
      achievements.push('Perfect Unity');
    }
    
    return achievements;
  }
}

// Export singleton instance
export const teamManager = new TeamManager();
