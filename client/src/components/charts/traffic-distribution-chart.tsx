import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TrafficDistributionChart() {
  const chartRef = useRef<any>(null);

  // Generate realistic traffic distribution data
  const generateTrafficData = () => {
    // Simulate slight variation in traffic distribution
    const baseDistribution = [52, 48];
    const variation = (Math.random() - 0.5) * 4; // ±2% variation
    
    const region1 = Math.max(45, Math.min(55, baseDistribution[0] + variation));
    const region2 = 100 - region1;
    
    return [region1, region2];
  };

  const data = generateTrafficData();

  const chartData = {
    labels: ['ap-south-1a', 'ap-south-1b'],
    datasets: [
      {
        data,
        backgroundColor: [
          'rgb(59, 130, 246)', // Blue
          'rgb(16, 185, 129)', // Green
        ],
        borderWidth: 0,
        hoverBackgroundColor: [
          'rgb(79, 146, 255)',
          'rgb(36, 201, 145)',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 10,
          },
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(243, 244, 246)',
        borderColor: 'rgb(75, 85, 99)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const percentage = context.parsed;
            return `${context.label}: ${percentage.toFixed(1)}%`;
          },
        },
      },
    },
    cutout: '60%',
  };

  // Update chart data every 45 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (chartRef.current) {
        const newData = generateTrafficData();
        chartRef.current.data.datasets[0].data = newData;
        chartRef.current.update('none');
      }
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  return <Doughnut ref={chartRef} data={chartData} options={options} />;
}
