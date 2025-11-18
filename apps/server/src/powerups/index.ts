import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import type { Player } from '@parlay-party/shared';

export enum PowerUpType {
  DOUBLE_POINTS = 'double_points',     // Next correct = 2x points
  STEAL_POINTS = 'steal_points',       // Steal points from leader
  IMMUNITY = 'immunity',               // No penalty for wrong call
  REVEAL_HINT = 'reveal_hint',         // Show one parlay category
  TIME_FREEZE = 'time_freeze',         // Extra time to decide
  COMBO_BREAKER = 'combo_breaker'      // Reset someone's combo
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  name: string;
  description: string;
  icon: string;
  color: string;
  cost: number;
  duration?: number; // Duration in seconds, if applicable
  cooldown: number; // Cooldown in seconds before can use again
}

export interface PlayerPowerUp {
  playerId: string;
  powerUpId: string;
  powerUp: PowerUp;
  quantity: number;
  activeUntil?: Date;
  lastUsed?: Date;
}

export interface PowerUpEffect {
  type: PowerUpType;
  targetPlayerId?: string;
  sourcePlayerId: string;
  expiresAt?: Date;
  metadata?: any;
}

export const POWER_UPS: Record<PowerUpType, PowerUp> = {
  [PowerUpType.DOUBLE_POINTS]: {
    id: 'double_points',
    type: PowerUpType.DOUBLE_POINTS,
    name: 'Double Points',
    description: 'Your next correct parlay earns 2x points',
    icon: '⚡',
    color: '#FFD700',
    cost: 5,
    cooldown: 60
  },
  [PowerUpType.STEAL_POINTS]: {
    id: 'steal_points',
    type: PowerUpType.STEAL_POINTS,
    name: 'Point Thief',
    description: 'Steal 2 points from the current leader',
    icon: '🦹',
    color: '#FF4444',
    cost: 8,
    cooldown: 120
  },
  [PowerUpType.IMMUNITY]: {
    id: 'immunity',
    type: PowerUpType.IMMUNITY,
    name: 'Immunity Shield',
    description: 'Protected from penalties for 30 seconds',
    icon: '🛡️',
    color: '#00D4FF',
    cost: 6,
    duration: 30,
    cooldown: 90
  },
  [PowerUpType.REVEAL_HINT]: {
    id: 'reveal_hint',
    type: PowerUpType.REVEAL_HINT,
    name: 'Crystal Ball',
    description: 'Reveals one upcoming parlay category',
    icon: '🔮',
    color: '#8B00FF',
    cost: 4,
    cooldown: 45
  },
  [PowerUpType.TIME_FREEZE]: {
    id: 'time_freeze',
    type: PowerUpType.TIME_FREEZE,
    name: 'Time Freeze',
    description: 'Get 5 extra seconds for your next decision',
    icon: '⏱️',
    color: '#00FF00',
    cost: 3,
    cooldown: 30
  },
  [PowerUpType.COMBO_BREAKER]: {
    id: 'combo_breaker',
    type: PowerUpType.COMBO_BREAKER,
    name: 'Combo Breaker',
    description: 'Reset an opponent\'s combo streak',
    icon: '💥',
    color: '#FF6B6B',
    cost: 7,
    cooldown: 90
  }
};

export class PowerUpManager {
  private activePowerUps: Map<string, PowerUpEffect[]> = new Map(); // playerId -> effects
  private playerInventory: Map<string, Map<PowerUpType, PlayerPowerUp>> = new Map(); // playerId -> type -> powerup
  private cooldowns: Map<string, Map<PowerUpType, Date>> = new Map(); // playerId -> type -> cooldown expiry

  constructor(private prisma: PrismaClient) {}

  /**
   * Initialize player with starting power-ups
   */
  initializePlayer(playerId: string): void {
    // Give players 1 free power-up to start
    const starterPowerUp = POWER_UPS[PowerUpType.TIME_FREEZE];
    this.grantPowerUp(playerId, starterPowerUp.type, 1);
  }

  /**
   * Grant power-up to player
   */
  grantPowerUp(playerId: string, type: PowerUpType, quantity: number = 1): PlayerPowerUp {
    if (!this.playerInventory.has(playerId)) {
      this.playerInventory.set(playerId, new Map());
    }

    const inventory = this.playerInventory.get(playerId)!;
    const existing = inventory.get(type);

    const powerUp = POWER_UPS[type];
    const playerPowerUp: PlayerPowerUp = {
      playerId,
      powerUpId: powerUp.id,
      powerUp,
      quantity: (existing?.quantity || 0) + quantity
    };

    inventory.set(type, playerPowerUp);

    logger.info('Power-up granted', { 
      playerId, 
      type, 
      quantity, 
      newTotal: playerPowerUp.quantity 
    });

    return playerPowerUp;
  }

  /**
   * Use a power-up
   */
  async usePowerUp(
    playerId: string, 
    type: PowerUpType, 
    targetPlayerId?: string
  ): Promise<{ success: boolean; message: string; effect?: PowerUpEffect }> {
    // Check if player has the power-up
    const inventory = this.playerInventory.get(playerId);
    const playerPowerUp = inventory?.get(type);

    if (!playerPowerUp || playerPowerUp.quantity <= 0) {
      return { success: false, message: 'You don\'t have this power-up!' };
    }

    // Check cooldown
    const cooldownExpiry = this.cooldowns.get(playerId)?.get(type);
    if (cooldownExpiry && cooldownExpiry > new Date()) {
      const secondsLeft = Math.ceil((cooldownExpiry.getTime() - Date.now()) / 1000);
      return { success: false, message: `Power-up on cooldown for ${secondsLeft}s` };
    }

    // Validate target if required
    if (type === PowerUpType.STEAL_POINTS || type === PowerUpType.COMBO_BREAKER) {
      if (!targetPlayerId) {
        return { success: false, message: 'Target player required' };
      }
    }

    // Create effect
    const powerUp = POWER_UPS[type];
    const effect: PowerUpEffect = {
      type,
      sourcePlayerId: playerId,
      targetPlayerId,
      expiresAt: powerUp.duration 
        ? new Date(Date.now() + powerUp.duration * 1000) 
        : undefined
    };

    // Add to active effects
    if (!this.activePowerUps.has(playerId)) {
      this.activePowerUps.set(playerId, []);
    }
    this.activePowerUps.get(playerId)!.push(effect);

    // Consume power-up
    playerPowerUp.quantity--;
    playerPowerUp.lastUsed = new Date();

    // Set cooldown
    if (!this.cooldowns.has(playerId)) {
      this.cooldowns.set(playerId, new Map());
    }
    this.cooldowns.get(playerId)!.set(
      type, 
      new Date(Date.now() + powerUp.cooldown * 1000)
    );

    logger.info('Power-up used', {
      playerId,
      type,
      targetPlayerId,
      remaining: playerPowerUp.quantity
    });

    return { 
      success: true, 
      message: `${powerUp.name} activated!`,
      effect 
    };
  }

  /**
   * Check if player has active immunity
   */
  hasImmunity(playerId: string): boolean {
    const effects = this.activePowerUps.get(playerId) || [];
    return effects.some(effect => 
      effect.type === PowerUpType.IMMUNITY && 
      (!effect.expiresAt || effect.expiresAt > new Date())
    );
  }

  /**
   * Check if player has double points active
   */
  hasDoublePoints(playerId: string): boolean {
    const effects = this.activePowerUps.get(playerId) || [];
    return effects.some(effect => effect.type === PowerUpType.DOUBLE_POINTS);
  }

  /**
   * Consume double points effect after use
   */
  consumeDoublePoints(playerId: string): void {
    const effects = this.activePowerUps.get(playerId) || [];
    const index = effects.findIndex(e => e.type === PowerUpType.DOUBLE_POINTS);
    if (index >= 0) {
      effects.splice(index, 1);
    }
  }

  /**
   * Get time extension for player
   */
  getTimeExtension(playerId: string): number {
    const effects = this.activePowerUps.get(playerId) || [];
    const timeFreeze = effects.find(e => e.type === PowerUpType.TIME_FREEZE);
    
    if (timeFreeze) {
      // Remove after use
      const index = effects.indexOf(timeFreeze);
      effects.splice(index, 1);
      return 5; // 5 seconds extension
    }
    
    return 0;
  }

  /**
   * Execute steal points effect
   */
  async executeStealPoints(
    sourcePlayerId: string, 
    targetPlayerId: string,
    prisma: PrismaClient
  ): Promise<{ stolenPoints: number }> {
    const stolenPoints = 2;

    // Update scores in database
    await prisma.player.update({
      where: { id: targetPlayerId },
      data: { scoreTotal: { decrement: stolenPoints } }
    });

    await prisma.player.update({
      where: { id: sourcePlayerId },
      data: { scoreTotal: { increment: stolenPoints } }
    });

    logger.info('Points stolen', { 
      sourcePlayerId, 
      targetPlayerId, 
      amount: stolenPoints 
    });

    return { stolenPoints };
  }

  /**
   * Get player's power-up inventory
   */
  getInventory(playerId: string): PlayerPowerUp[] {
    const inventory = this.playerInventory.get(playerId);
    if (!inventory) return [];

    return Array.from(inventory.values()).filter(p => p.quantity > 0);
  }

  /**
   * Get active effects for a player
   */
  getActiveEffects(playerId: string): PowerUpEffect[] {
    const effects = this.activePowerUps.get(playerId) || [];
    const now = new Date();
    
    // Filter out expired effects
    const activeEffects = effects.filter(effect => 
      !effect.expiresAt || effect.expiresAt > now
    );

    // Update the stored effects
    this.activePowerUps.set(playerId, activeEffects);
    
    return activeEffects;
  }

  /**
   * Get cooldowns for a player
   */
  getCooldowns(playerId: string): Map<PowerUpType, number> {
    const cooldowns = this.cooldowns.get(playerId) || new Map();
    const now = Date.now();
    const result = new Map<PowerUpType, number>();

    cooldowns.forEach((expiry, type) => {
      const remaining = Math.max(0, Math.ceil((expiry.getTime() - now) / 1000));
      if (remaining > 0) {
        result.set(type, remaining);
      }
    });

    return result;
  }

  /**
   * Purchase power-up with points
   */
  async purchasePowerUp(
    playerId: string, 
    type: PowerUpType,
    playerScore: number
  ): Promise<{ success: boolean; message: string }> {
    const powerUp = POWER_UPS[type];
    
    if (playerScore < powerUp.cost) {
      return { 
        success: false, 
        message: `Not enough points! Need ${powerUp.cost}, have ${playerScore}` 
      };
    }

    // Deduct points
    await this.prisma.player.update({
      where: { id: playerId },
      data: { scoreTotal: { decrement: powerUp.cost } }
    });

    // Grant power-up
    this.grantPowerUp(playerId, type);

    return { 
      success: true, 
      message: `Purchased ${powerUp.name} for ${powerUp.cost} points!` 
    };
  }

  /**
   * Clean up expired effects
   */
  cleanupExpiredEffects(): void {
    const now = new Date();

    this.activePowerUps.forEach((effects, playerId) => {
      const activeEffects = effects.filter(effect => 
        !effect.expiresAt || effect.expiresAt > now
      );
      this.activePowerUps.set(playerId, activeEffects);
    });
  }

  /**
   * Reset player power-ups (for new game)
   */
  resetPlayer(playerId: string): void {
    this.playerInventory.delete(playerId);
    this.activePowerUps.delete(playerId);
    this.cooldowns.delete(playerId);
  }
}

// Export singleton instance
let powerUpManager: PowerUpManager;

export function initializePowerUpManager(prisma: PrismaClient): PowerUpManager {
  if (!powerUpManager) {
    powerUpManager = new PowerUpManager(prisma);
  }
  return powerUpManager;
}

export { powerUpManager };
