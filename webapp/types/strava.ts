// Strava Activity Types
export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type?: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  start_date_local: string;
  average_speed?: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  max_watts?: number;
  average_cadence?: number;
  kilojoules?: number;
  kudos_count?: number;
}

// Summary Stats Types
export interface StatsPeriod {
  count: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  elevation_gain: number;
  achievement_count?: number;
}

export interface SummaryStats {
  recent: StatsPeriod;
  ytd: StatsPeriod;
  all_time: StatsPeriod;
}

// Performance Metrics Types
export interface Zone {
  min: number;
  max: number;
  time?: number;
}

export interface TrainingLoad {
  acute: number;
  chronic: number;
  ratio: number;
}

export interface PerformanceMetrics {
  hrZones: Zone[];
  powerZones: Zone[];
  trainingLoad: TrainingLoad;
}

// Trend Data Types
export interface TrendDataPoint {
  date: string;
  distance: number;
  elevation: number;
  activity_count: number;
}

export type TrendPeriod = "week" | "month" | "year";

// Context State Types
export interface StravaDataContextType {
  // Data
  stats: SummaryStats | null;
  activities: StravaActivity[] | null;
  performance: PerformanceMetrics | null;
  trends: TrendDataPoint[] | null;
  trendPeriod: TrendPeriod;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Methods
  refreshStats: () => Promise<void>;
  refreshActivities: (days?: number) => Promise<void>;
  refreshPerformance: () => Promise<void>;
  refreshTrends: (period?: TrendPeriod) => Promise<void>;
  refreshAll: () => Promise<void>;

  // Chat integration
  updateFromChat: (data: Partial<StravaDataContextType>) => void;
}
