import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { moodApi } from '../services/api';
import type { TrendData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MoodTrendsProps {
  period: 'daily' | 'weekly' | 'monthly';
}

const MoodTrends: React.FC<MoodTrendsProps> = ({ period }) => {
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrends = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const data = await moodApi.getTrends(period);
        setTrendData(data);
      } catch (err) {
        setError('Failed to load trend data');
        console.error('Error fetching trends:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, [period]);

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading trends...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!trendData || trendData.data.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No mood data available</div>
          <div className="text-sm text-gray-400">
            Start capturing your mood to see trends here
          </div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: trendData.data.map(point => {
      const date = new Date(point.date);
      if (period === 'daily') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (period === 'weekly') {
        return `Week ${point.date.split('-W')[1]}`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    }),
    datasets: [
      {
        label: 'Happiness',
        data: trendData.data.map(point => point.happiness * 100),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Stress',
        data: trendData.data.map(point => point.stress * 100),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Arousal',
        data: trendData.data.map(point => point.arousal * 100),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Valence',
        data: trendData.data.map(point => (point.valence + 1) * 50), // Convert -1 to 1 scale to 0 to 100
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.3,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Mood Trends (${period.charAt(0).toUpperCase() + period.slice(1)})`,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            
            if (datasetLabel === 'Valence') {
              // Convert back to original scale for display
              const originalValue = (value - 50) / 50;
              return `${datasetLabel}: ${originalValue >= 0 ? '+' : ''}${originalValue.toFixed(1)}`;
            }
            
            return `${datasetLabel}: ${value.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  // Calculate summary statistics
  const avgHappiness = trendData.data.reduce((sum, point) => sum + point.happiness, 0) / trendData.data.length;
  const avgStress = trendData.data.reduce((sum, point) => sum + point.stress, 0) / trendData.data.length;
  const avgValence = trendData.data.reduce((sum, point) => sum + point.valence, 0) / trendData.data.length;
  const avgArousal = trendData.data.reduce((sum, point) => sum + point.arousal, 0) / trendData.data.length;
  const totalEntries = trendData.data.reduce((sum, point) => sum + point.count, 0);

  return (
    <div className="card">
      <div className="mb-6">
        <Line data={chartData} options={options} />
      </div>
      
      {/* Summary Statistics */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Period Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className="text-green-600 font-medium">
              {(avgHappiness * 100).toFixed(1)}%
            </div>
            <div className="text-gray-500">Avg Happiness</div>
          </div>
          <div className="text-center">
            <div className="text-red-600 font-medium">
              {(avgStress * 100).toFixed(1)}%
            </div>
            <div className="text-gray-500">Avg Stress</div>
          </div>
          <div className="text-center">
            <div className="text-purple-600 font-medium">
              {avgValence >= 0 ? '+' : ''}{avgValence.toFixed(2)}
            </div>
            <div className="text-gray-500">Avg Valence</div>
          </div>
          <div className="text-center">
            <div className="text-blue-600 font-medium">
              {(avgArousal * 100).toFixed(1)}%
            </div>
            <div className="text-gray-500">Avg Arousal</div>
          </div>
          <div className="text-center">
            <div className="text-gray-900 font-medium">
              {totalEntries}
            </div>
            <div className="text-gray-500">Total Entries</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTrends;