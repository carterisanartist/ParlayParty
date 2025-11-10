import { clusterVotes, shouldAutoPause, checkTwoPlayerConsensus } from './clustering';

describe('Vote Clustering', () => {
  it('should cluster votes with same normalized text within time window', () => {
    const votes = [
      { playerId: 'p1', normalizedText: 'cat jumps', tVideoSec: 10.0, createdAt: new Date() },
      { playerId: 'p2', normalizedText: 'cat jumps', tVideoSec: 10.5, createdAt: new Date() },
      { playerId: 'p3', normalizedText: 'cat jumps', tVideoSec: 11.0, createdAt: new Date() },
    ];

    const clusters = clusterVotes(votes, 2.5);
    
    expect(clusters.length).toBe(1);
    expect(clusters[0].normalizedText).toBe('cat jumps');
    expect(clusters[0].count).toBe(3);
    expect(clusters[0].voters).toEqual(['p1', 'p2', 'p3']);
  });

  it('should not cluster votes outside time window', () => {
    const votes = [
      { playerId: 'p1', normalizedText: 'cat jumps', tVideoSec: 10.0, createdAt: new Date() },
      { playerId: 'p2', normalizedText: 'cat jumps', tVideoSec: 15.0, createdAt: new Date() },
    ];

    const clusters = clusterVotes(votes, 2.5);
    
    expect(clusters.length).toBe(2);
  });

  it('should determine auto-pause based on threshold', () => {
    const cluster = {
      normalizedText: 'test',
      voters: ['p1', 'p2', 'p3'],
      tCenter: 10,
      tMin: 9.5,
      tMax: 10.5,
      count: 3,
    };

    const shouldPause = shouldAutoPause(cluster, 5, 0.5, 3);
    expect(shouldPause).toBe(true);

    const shouldNotPause = shouldAutoPause(cluster, 10, 0.5, 3);
    expect(shouldNotPause).toBe(false);
  });

  it('should handle unanimous two-player mode', () => {
    const votes = [
      { playerId: 'p1', normalizedText: 'cat jumps', tVideoSec: 10.0, createdAt: new Date() },
      { playerId: 'p2', normalizedText: 'cat jumps', tVideoSec: 10.3, createdAt: new Date() },
    ];

    const cluster = checkTwoPlayerConsensus(votes, 'unanimous', 2);
    
    expect(cluster).not.toBeNull();
    expect(cluster?.count).toBe(2);
  });

  it('should not trigger unanimous with different texts', () => {
    const votes = [
      { playerId: 'p1', normalizedText: 'cat jumps', tVideoSec: 10.0, createdAt: new Date() },
      { playerId: 'p2', normalizedText: 'dog barks', tVideoSec: 10.3, createdAt: new Date() },
    ];

    const cluster = checkTwoPlayerConsensus(votes, 'unanimous', 2);
    
    expect(cluster).toBeNull();
  });
});

