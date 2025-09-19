export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
  has_consented: boolean;
  consent_date?: string;
}

export interface MoodEntry {
  id: number;
  user_id: number;
  happiness: number;    // 0-1 scale
  stress: number;       // 0-1 scale
  valence: number;      // -1 to 1 scale (negative to positive)
  arousal: number;      // 0-1 scale (calm to excited)
  confidence: number;   // 0-1 scale (confidence in the analysis)
  created_at: string;
}

export interface UserSettings {
  id: number;
  user_id: number;
  data_retention_days: number;
  export_format: 'json' | 'csv';
  created_at: string;
  updated_at: string;
}

export interface AuthToken {
  token: string;
  expiresAt: number;
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