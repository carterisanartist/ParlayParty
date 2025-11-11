import { determineLoser } from './scoring';
import { calculateRarityWeight } from '@parlay-party/shared';

describe('Scoring Engine', () => {
  it('should calculate rarity weight correctly', () => {
    const weight1 = calculateRarityWeight('common', [
      { normalizedText: 'common' }, { normalizedText: 'common' }
    ]);
    const weight2 = calculateRarityWeight('rare', [
      { normalizedText: 'common' }, { normalizedText: 'common' }, { normalizedText: 'rare' }
    ]);
    
    expect(weight2).toBeGreaterThan(weight1);
    
    const weight3 = calculateRarityWeight('unique', [{ normalizedText: 'unique' }]);
    expect(weight3).toBeGreaterThan(weight2);
  });

  it('should determine loser by lowest score', () => {
    const parlays = [
      { playerId: 'p1', scoreFinal: 10.0, legsHit: 2, accuracy: 1.0, completedAt: new Date() },
      { playerId: 'p2', scoreFinal: 5.0, legsHit: 1, accuracy: 0.5, completedAt: new Date() },
      { playerId: 'p3', scoreFinal: 15.0, legsHit: 3, accuracy: 1.0, completedAt: new Date() },
    ];

    const loser = determineLoser(parlays);
    expect(loser).toBe('p2');
  });

  it('should use tie-breaker for same score', () => {
    const parlays = [
      { playerId: 'p1', scoreFinal: 5.0, legsHit: 2, accuracy: 1.0, completedAt: new Date() },
      { playerId: 'p2', scoreFinal: 5.0, legsHit: 1, accuracy: 0.5, completedAt: new Date() },
    ];

    const loser = determineLoser(parlays);
    expect(loser).toBe('p2');
  });

  it('should handle no parlays', () => {
    const loser = determineLoser([]);
    expect(loser).toBeNull();
  });
});

