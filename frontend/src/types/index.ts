export interface User {
  id: number;
  email: string;
  created_at: string;
  has_consented: boolean;
  consent_date?: string;
}

export interface MoodEntry {
  id: number;
  user_id: number;
  happiness: number;
  stress: number;
  valence: number;
  arousal: number;
  confidence: number;
  created_at: string;
}

export interface MoodAnalysis {
  happiness: number;
  stress: number;
  valence: number;
  arousal: number;
  confidence: number;
}

export interface TrendData {
  period: 'daily' | 'weekly' | 'monthly';
  data: {
    date: string;
    happiness: number;
    stress: number;
    valence: number;
    arousal: number;
    count: number;
  }[];
}

export interface AuthResponse {
  token: string;
  userId: number;
  message: string;
}

export interface UserStats {
  totalEntries: number;
  averages: {
    happiness: number;
    stress: number;
    valence: number;
    arousal: number;
  };
  firstEntry?: string;
  lastEntry?: string;
}