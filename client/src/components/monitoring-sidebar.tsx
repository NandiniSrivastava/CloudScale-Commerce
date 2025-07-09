import { ChevronLeft, ChevronRight, Activity, Server, Gauge, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CPUChart from "./charts/cpu-chart";
import ResponseTimeChart from "./charts/response-time-chart";
import TrafficDistributionChart from "./charts/traffic-distribution-chart";

interface MonitoringSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  metrics?: {
    activeUsers: number;
    ec2Instances: number;
    cpuUtilization: string;
    responseTime: number;
    loadPercentage: number;
    scalingStatus: string;
  };
  connected: boolean;
}

export default function MonitoringSidebar({ 
  collapsed, 
  onToggle, 
  metrics,
  connected 
}: MonitoringSidebarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/20 text-green-400';
      case 'scaling':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-red-500/20 text-red-400';
    }
  };

  const getLoadBarColor = (percentage: number) => {
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-50 sidebar-transition ${
      collapsed ? '-translate-x-full' : 'translate-x-0'
    }`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            AWS Monitoring
          </h2>
          <button 
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          Region: ap-south-1 • {connected ? 'Live Data' : 'Disconnected'}
        </div>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto h-full pb-20">
        {/* Current Load Status */}
        <Card className="metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Current Load Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Active Users:</span>
              <span className="text-lg font-semibold text-green-400">
                {metrics?.activeUsers || 4}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">EC2 Instances:</span>
              <span className="text-lg font-semibold text-primary">
                {metrics?.ec2Instances || 2}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  getLoadBarColor(metrics?.loadPercentage || 65)
                }`}
                style={{ width: `${metrics?.loadPercentage || 65}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Load: {metrics?.loadPercentage || 65}%
            </div>
          </CardContent>
        </Card>

        {/* Auto Scaling Status */}
        <Card className="metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Auto Scaling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status:</span>
              <Badge className={getStatusColor(metrics?.scalingStatus || 'healthy')}>
                {metrics?.scalingStatus === 'scaling' ? (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                ) : (
                  <CheckCircle className="w-3 h-3 mr-1" />
                )}
                {metrics?.scalingStatus || 'Healthy'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Min/Max:</span>
              <span className="text-xs text-foreground">2/10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">CPU Threshold:</span>
              <span className="text-xs text-foreground">70%</span>
            </div>
          </CardContent>
        </Card>

        {/* CPU Utilization Chart */}
        <Card className="metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">CPU Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              <CPUChart />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Last 10 minutes</div>
          </CardContent>
        </Card>

        {/* Response Time Chart */}
        <Card className="metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              <ResponseTimeChart />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Average: <span className="text-green-400">{metrics?.responseTime || 245}ms</span>
            </div>
          </CardContent>
        </Card>

        {/* Load Balancer Health */}
        <Card className="metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">ALB Health Checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
              <span className="text-xs">ap-south-1a</span>
              <Badge className="bg-green-500/20 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1" />
                Healthy
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
              <span className="text-xs">ap-south-1b</span>
              <Badge className="bg-green-500/20 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1" />
                Healthy
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Distribution */}
        <Card className="metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Traffic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <TrafficDistributionChart />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
