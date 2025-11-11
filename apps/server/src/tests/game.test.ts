import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { normalizeText } from '@parlay-party/shared';
import { calculateEventScore } from '../scoring';

const prisma = new PrismaClient();

describe('Game Logic Tests', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.player.deleteMany();
    await prisma.room.deleteMany();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.player.deleteMany();
    await prisma.room.deleteMany();
  });

  describe('Text Normalization', () => {
    it('should normalize text correctly', () => {
      expect(normalizeText('Hello World!')).toBe('hello world');
      expect(normalizeText('  CATS   JUMP  ')).toBe('cats jump');
      expect(normalizeText('special@chars#removed')).toBe('special chars removed');
    });
  });

  describe('Scoring System', () => {
    it('should calculate event scores correctly', () => {
      const mockParlays = [
        { normalizedText: 'cats jump', playerId: '1' },
        { normalizedText: 'dogs run', playerId: '2' },
        { normalizedText: 'cats jump', playerId: '3' },
      ];

      const score1 = calculateEventScore('cats jump', mockParlays);
      const score2 = calculateEventScore('dogs run', mockParlays);

      expect(score2).toBeGreaterThan(score1); // Rarer events score higher
      expect(score1).toBeGreaterThan(0);
      expect(score2).toBeGreaterThan(0);
    });
  });

  describe('Database Operations', () => {
    it('should create room and player successfully', async () => {
      const room = await prisma.room.create({
        data: {
          code: 'TEST123',
          hostId: 'temp',
          status: 'lobby',
          settings: {},
        },
      });

      const player = await prisma.player.create({
        data: {
          roomId: room.id,
          name: 'TestPlayer',
          isHost: true,
        },
      });

      expect(room.code).toBe('TEST123');
      expect(player.name).toBe('TestPlayer');
      expect(player.isHost).toBe(true);
    });

    it('should handle player reconnection correctly', async () => {
      const room = await prisma.room.create({
        data: {
          code: 'TEST456',
          hostId: 'temp',
          status: 'lobby', 
          settings: {},
        },
      });

      // Create initial player
      const player1 = await prisma.player.create({
        data: {
          roomId: room.id,
          name: 'TestPlayer',
          isHost: true,
        },
      });

      // Check if player exists (simulating reconnection logic)
      const existingPlayer = await prisma.player.findFirst({
        where: { roomId: room.id, name: 'TestPlayer' }
      });

      expect(existingPlayer).toBeTruthy();
      expect(existingPlayer?.id).toBe(player1.id);
    });
  });
});
