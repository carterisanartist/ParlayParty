// Shared Utility Functions with Proper TypeScript Types

/**
 * Normalize text for consistent comparison
 * Removes special characters, extra whitespace, and converts to lowercase
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate a random room code
 * Returns a 6-character alphanumeric code
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Calculate rarity weight for scoring system
 * More unique events get higher weights
 */
export function calculateRarityWeight(normalizedText: string, allParlays: Array<{ normalizedText: string }>): number {
  const count = allParlays.filter(p => p.normalizedText === normalizedText).length;
  const total = allParlays.length;
  const frequency = count / total;
  
  // Rarer events (lower frequency) get higher weights
  return Math.max(0.1, 1 - frequency);
}

/**
 * Calculate final score based on rarity and bonuses
 */
export function calculateScore(
  rarityWeight: number,
  fastTapBonus: number = 0,
  baseScore: number = 1
): number {
  return baseScore * rarityWeight + fastTapBonus;
}

/**
 * Select weighted random item from array
 * Used for wheel spinning and random selection
 */
export function selectWeightedRandom<T extends { weight?: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= (item.weight || 1);
    if (random <= 0) {
      return item;
    }
  }
  
  return items[0]; // Fallback
}

/**
 * Create commit seed for cryptographically fair randomness
 */
export function createCommitSeed(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Format time duration in human-readable format
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Debounce function to limit rapid function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Throttle function to limit function execution rate
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}