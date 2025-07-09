import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ResponseTimeChart() {
  const chartRef = useRef<any>(null);

  // Generate realistic response time data
  const generateResponseTimeData = () => {
    const now = new Date();
    const data = [];
    const labels = [];
    
    for (let i = 9; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000); // 1 minute intervals
      labels.push(time.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
      
      // Generate realistic response times between 150-400ms
      const baseTime = 250 + Math.sin(i * 0.3) * 50;
      const variation = (Math.random() - 0.5) * 40;
      data.push(Math.max(150, Math.min(400, baseTime + variation)));
    }
    
    return { labels, data };
  };

  const { labels, data } = generateResponseTimeData();

  const chartData = {
    labels,
    datasets: [
      {
        data,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(243, 244, 246)',
        borderColor: 'rgb(75, 85, 99)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `Response: ${Math.round(context.parsed.y)}ms`;
          },
        },
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        min: 100,
        max: 500,
        grid: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: 'rgb(16, 185, 129)',
      },
    },
  };

  // Update chart data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (chartRef.current) {
        const { labels: newLabels, data: newData } = generateResponseTimeData();
        chartRef.current.data.labels = newLabels;
        chartRef.current.data.datasets[0].data = newData;
        chartRef.current.update('none');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return <Line ref={chartRef} data={chartData} options={options} />;
}
