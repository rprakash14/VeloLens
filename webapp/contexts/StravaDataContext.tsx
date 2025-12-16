"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  StravaDataContextType,
  SummaryStats,
  StravaActivity,
  PerformanceMetrics,
  TrendDataPoint,
  TrendPeriod,
} from "@/types/strava";

const StravaDataContext = createContext<StravaDataContextType | undefined>(undefined);

export function StravaDataProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [activities, setActivities] = useState<StravaActivity[] | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [trends, setTrends] = useState<TrendDataPoint[] | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>("week");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching stats:", err);
    }
  }, []);

  const refreshActivities = useCallback(async (days: number = 7) => {
    try {
      const response = await fetch(`/api/dashboard/activities?days=${days}`);
      if (!response.ok) throw new Error("Failed to fetch activities");
      const data = await response.json();
      setActivities(data.activities);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching activities:", err);
    }
  }, []);

  const refreshPerformance = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/performance");
      if (!response.ok) throw new Error("Failed to fetch performance");
      const data = await response.json();
      setPerformance(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching performance:", err);
    }
  }, []);

  const refreshTrends = useCallback(async (period: TrendPeriod = "week") => {
    try {
      setTrendPeriod(period);
      const response = await fetch(`/api/dashboard/trends?period=${period}`);
      if (!response.ok) throw new Error("Failed to fetch trends");
      const data = await response.json();
      setTrends(data.trends);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching trends:", err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        refreshStats(),
        refreshActivities(7),
        refreshPerformance(),
        refreshTrends(trendPeriod),
      ]);
    } catch (err: any) {
      setError("Failed to refresh dashboard data");
      console.error("Error refreshing all data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats, refreshActivities, refreshPerformance, refreshTrends, trendPeriod]);

  const updateFromChat = useCallback((data: Partial<StravaDataContextType>) => {
    if (data.stats) setStats(data.stats);
    if (data.activities) setActivities(data.activities);
    if (data.performance) setPerformance(data.performance);
    if (data.trends) setTrends(data.trends);
  }, []);

  const value: StravaDataContextType = {
    stats,
    activities,
    performance,
    trends,
    trendPeriod,
    isLoading,
    error,
    refreshStats,
    refreshActivities,
    refreshPerformance,
    refreshTrends,
    refreshAll,
    updateFromChat,
  };

  return (
    <StravaDataContext.Provider value={value}>
      {children}
    </StravaDataContext.Provider>
  );
}

export function useStravaData() {
  const context = useContext(StravaDataContext);
  if (context === undefined) {
    throw new Error("useStravaData must be used within a StravaDataProvider");
  }
  return context;
}
