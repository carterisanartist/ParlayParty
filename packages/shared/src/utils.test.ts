import { normalizeText, calculateRarityWeight, selectWeightedRandom } from './utils';

describe('Shared Utils', () => {
  describe('normalizeText', () => {
    it('should trim and lowercase text', () => {
      expect(normalizeText('  Hello World  ')).toBe('hello world');
    });

    it('should collapse multiple spaces', () => {
      expect(normalizeText('hello    world')).toBe('hello world');
    });
  });

  describe('calculateRarityWeight', () => {
    it('should return higher weight for rare events', () => {
      const commonWeight = calculateRarityWeight('common', [
        { normalizedText: 'common' }, { normalizedText: 'common' }, { normalizedText: 'rare' }
      ]);
      const rareWeight = calculateRarityWeight('rare', [
        { normalizedText: 'common' }, { normalizedText: 'common' }, { normalizedText: 'rare' }
      ]);
      
      expect(rareWeight).toBeGreaterThan(commonWeight);
    });

    it('should never return weight less than 1', () => {
      const weight = calculateRarityWeight('test', [{ normalizedText: 'test' }]);
      expect(weight).toBeGreaterThanOrEqual(1);
    });
  });

  describe('selectWeightedRandom', () => {
    it('should select item based on weights', () => {
      const items = [
        { id: 1, weight: 1.0 },
        { id: 2, weight: 9.0 },
      ];

      const results = new Map<number, number>();
      for (let i = 0; i < 100; i++) {
        const selected = selectWeightedRandom(items);
        if (selected) {
          results.set(selected.id, (results.get(selected.id) || 0) + 1);
        }
      }

      const id2Count = results.get(2) || 0;
      const id1Count = results.get(1) || 0;
      
      expect(id2Count).toBeGreaterThan(id1Count);
    });

    it('should return same result for same seed', () => {
      const items = [
        { id: 1, weight: 1.0 },
        { id: 2, weight: 1.0 },
      ];

      const result1 = selectWeightedRandom(items);
      const result2 = selectWeightedRandom(items);
      
      expect(result1?.id).toBe(result2?.id);
    });

    it('should handle empty array', () => {
      const result = selectWeightedRandom([]);
      expect(result).toBeNull();
    });
  });
});

