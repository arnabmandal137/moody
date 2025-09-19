import axios from 'axios';
import type { AuthResponse, MoodAnalysis, TrendData, User, UserStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (email: string, password: string, hasConsented: boolean): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { email, password, hasConsented });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const moodApi = {
  createEntry: async (analysis: MoodAnalysis): Promise<{ id: number }> => {
    const response = await api.post('/mood/entries', analysis);
    return response.data;
  },

  getEntries: async (page = 1, limit = 20) => {
    const response = await api.get(`/mood/entries?page=${page}&limit=${limit}`);
    return response.data;
  },

  getTrends: async (period: 'daily' | 'weekly' | 'monthly'): Promise<TrendData> => {
    const response = await api.get(`/mood/trends/${period}`);
    return response.data;
  },

  deleteEntry: async (id: number): Promise<void> => {
    await api.delete(`/mood/entries/${id}`);
  },
};

export const userApi = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  getStats: async (): Promise<UserStats> => {
    const response = await api.get('/user/stats');
    return response.data;
  },

  exportData: async (format: 'json' | 'csv'): Promise<Blob> => {
    const response = await api.get(`/user/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  deleteAllData: async (): Promise<void> => {
    await api.delete('/user/data');
  },
};