import { logger } from './logger';

interface Metrics {
  activeConnections: number;
  totalRooms: number;
  activeGames: number;
  totalVotes: number;
  averageLatency: number;
  errorCount: number;
}

class MetricsCollector {
  private metrics: Metrics = {
    activeConnections: 0,
    totalRooms: 0,
    activeGames: 0,
    totalVotes: 0,
    averageLatency: 0,
    errorCount: 0,
  };

  private latencySum = 0;
  private latencyCount = 0;

  incrementConnections() {
    this.metrics.activeConnections++;
  }

  decrementConnections() {
    this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);
  }

  addLatency(latency: number) {
    this.latencySum += latency;
    this.latencyCount++;
    this.metrics.averageLatency = this.latencySum / this.latencyCount;
  }

  incrementVotes() {
    this.metrics.totalVotes++;
  }

  incrementErrors() {
    this.metrics.errorCount++;
  }

  updateRoomStats(totalRooms: number, activeGames: number) {
    this.metrics.totalRooms = totalRooms;
    this.metrics.activeGames = activeGames;
  }

  getMetrics(): Metrics {
    return { ...this.metrics };
  }

  logMetrics() {
    logger.info('Application metrics', this.metrics);
  }
}

export const metricsCollector = new MetricsCollector();

// Log metrics every 5 minutes
setInterval(() => {
  metricsCollector.logMetrics();
}, 300000);
