import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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

const TrafficChart: React.FC = () => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
        }
      }
    }
  };

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Visitors',
        data: [1200, 1900, 1500, 2200, 1800, 2800, 2400],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
      },
      {
        fill: true,
        label: 'Page Views',
        data: [3200, 4100, 3500, 5200, 4800, 6800, 5400],
        borderColor: '#c084fc',
        backgroundColor: 'rgba(192, 132, 252, 0.2)',
        tension: 0.4,
      }
    ],
  };

  return <Line options={options} data={data} />;
};

export default TrafficChart;
