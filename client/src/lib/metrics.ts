export interface MetricsData {
  activeUsers: number;
  ec2Instances: number;
  cpuUtilization: number;
  responseTime: number;
  loadPercentage: number;
  scalingStatus: 'healthy' | 'scaling' | 'error';
  timestamp: Date;
}

export interface HistoricalMetrics {
  timestamp: Date;
  cpuUtilization: number;
  responseTime: number;
  activeUsers: number;
}

export class MetricsSimulator {
  private baseUsers: number = 4;
  private currentMetrics: MetricsData;

  constructor() {
    this.currentMetrics = this.generateInitialMetrics();
  }

  private generateInitialMetrics(): MetricsData {
    return {
      activeUsers: this.baseUsers,
      ec2Instances: 2,
      cpuUtilization: 35,
      responseTime: 245,
      loadPercentage: 65,
      scalingStatus: 'healthy',
      timestamp: new Date(),
    };
  }

  public simulateUserIncrease(): MetricsData {
    // Simulate gradual user increase
    const userVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    this.currentMetrics.activeUsers = Math.max(1, this.baseUsers + userVariation);
    
    // Simulate auto-scaling behavior
    if (this.currentMetrics.activeUsers >= 5) {
      this.currentMetrics.ec2Instances = Math.min(
        Math.floor(this.currentMetrics.activeUsers / 2) + 1,
        10
      );
      this.currentMetrics.scalingStatus = 'scaling';
    } else {
      this.currentMetrics.ec2Instances = 2;
      this.currentMetrics.scalingStatus = 'healthy';
    }

    // Update CPU utilization based on load
    const baseLoad = (this.currentMetrics.activeUsers / this.currentMetrics.ec2Instances) * 20;
    this.currentMetrics.cpuUtilization = Math.min(
      Math.max(baseLoad + (Math.random() * 10 - 5), 15),
      85
    );

    // Update response time based on load
    const loadFactor = this.currentMetrics.activeUsers / this.currentMetrics.ec2Instances;
    this.currentMetrics.responseTime = Math.floor(
      200 + (loadFactor * 50) + (Math.random() * 40 - 20)
    );

    // Update load percentage
    this.currentMetrics.loadPercentage = Math.floor(
      (this.currentMetrics.activeUsers / 10) * 100
    );

    this.currentMetrics.timestamp = new Date();
    return { ...this.currentMetrics };
  }

  public getCurrentMetrics(): MetricsData {
    return { ...this.currentMetrics };
  }

  public generateHistoricalData(points: number = 10): HistoricalMetrics[] {
    const history: HistoricalMetrics[] = [];
    const now = new Date();

    for (let i = points - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000); // 1 minute intervals
      const activeUsers = Math.max(1, this.baseUsers + Math.floor(Math.random() * 3) - 1);
      const cpuUtilization = 20 + Math.sin(i * 0.5) * 15 + (Math.random() * 10 - 5);
      const responseTime = 200 + Math.sin(i * 0.3) * 50 + (Math.random() * 40 - 20);

      history.push({
        timestamp,
        activeUsers,
        cpuUtilization: Math.max(15, Math.min(85, cpuUtilization)),
        responseTime: Math.max(150, Math.min(400, responseTime)),
      });
    }

    return history;
  }
}

export const metricsSimulator = new MetricsSimulator();
