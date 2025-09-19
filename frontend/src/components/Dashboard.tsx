import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../services/api';
import type { UserStats } from '../types';
import SelfieCapture from './SelfieCapture';
import MoodTrends from './MoodTrends';
import { 
  ChartBarIcon, 
  CameraIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'capture' | 'trends' | 'settings'>('capture');
  const [trendPeriod, setTrendPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const userStats = await userApi.getStats();
        setStats(userStats);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleMoodCaptured = () => {
    // Refresh stats after a new mood entry
    if (user) {
      userApi.getStats().then(setStats).catch(console.error);
    }
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    try {
      const blob = await userApi.exportData(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moody-data.${format}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to export data');
    }
  };

  const handleDeleteData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete all your data? This action cannot be undone.'
    );
    
    if (confirmed) {
      try {
        await userApi.deleteAllData();
        logout();
      } catch (error) {
        alert('Failed to delete data');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Moody</h1>
              {user && (
                <div className="ml-4 flex items-center text-sm text-gray-500">
                  <UserIcon className="h-4 w-4 mr-1" />
                  {user.email}
                </div>
              )}
            </div>
            
            <button
              onClick={logout}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('capture')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'capture'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CameraIcon className="h-4 w-4 inline mr-2" />
              Capture Mood
            </button>
            
            <button
              onClick={() => setActiveTab('trends')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trends'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="h-4 w-4 inline mr-2" />
              Trends
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Cog6ToothIcon className="h-4 w-4 inline mr-2" />
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        {stats && !isLoadingStats && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="text-2xl font-bold text-gray-900">{stats.totalEntries}</div>
              <div className="text-sm text-gray-500">Total Entries</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-green-600">
                {(stats.averages.happiness * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Avg Happiness</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-red-600">
                {(stats.averages.stress * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Avg Stress</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-purple-600">
                {stats.averages.valence >= 0 ? '+' : ''}{stats.averages.valence.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Avg Valence</div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'capture' && (
          <div>
            <SelfieCapture onMoodCaptured={handleMoodCaptured} />
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex justify-center">
              <div className="bg-white rounded-lg border border-gray-200 p-1">
                {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTrendPeriod(period)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      trendPeriod === period
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <MoodTrends period={trendPeriod} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Account Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2">{user?.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">Member since:</span>
                  <span className="ml-2">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Consent status:</span>
                  <span className={`ml-2 ${user?.has_consented ? 'text-green-600' : 'text-red-600'}`}>
                    {user?.has_consented ? 'Consented' : 'Not consented'}
                  </span>
                </div>
              </div>
            </div>

            {/* Data Export */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
              <p className="text-sm text-gray-600 mb-4">
                Download all your mood data in your preferred format.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleExportData('json')}
                  className="btn btn-secondary"
                >
                  Export as JSON
                </button>
                <button 
                  onClick={() => handleExportData('csv')}
                  className="btn btn-secondary"
                >
                  Export as CSV
                </button>
              </div>
            </div>

            {/* Data Deletion */}
            <div className="card border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Delete Account</h3>
              <p className="text-sm text-red-700 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button 
                onClick={handleDeleteData}
                className="btn btn-danger"
              >
                Delete All Data
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;