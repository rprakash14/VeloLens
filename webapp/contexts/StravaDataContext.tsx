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

  const refreshStats = useCallback(async (skipCache: boolean = false) => {
    try {
      const url = skipCache ? "/api/dashboard/stats?skipCache=true" : "/api/dashboard/stats";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching stats:", err);
    }
  }, []);

  const refreshActivities = useCallback(async (days: number = 7, skipCache: boolean = false) => {
    try {
      const url = `/api/dashboard/activities?days=${days}${skipCache ? '&skipCache=true' : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch activities");
      const data = await response.json();
      setActivities(data.activities);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching activities:", err);
    }
  }, []);

  const refreshPerformance = useCallback(async (skipCache: boolean = false) => {
    try {
      const url = skipCache ? "/api/dashboard/performance?skipCache=true" : "/api/dashboard/performance";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch performance");
      const data = await response.json();
      setPerformance(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching performance:", err);
    }
  }, []);

  const refreshTrends = useCallback(async (period: TrendPeriod = "week", skipCache: boolean = false) => {
    try {
      setTrendPeriod(period);
      const url = `/api/dashboard/trends?period=${period}${skipCache ? '&skipCache=true' : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch trends");
      const data = await response.json();
      setTrends(data.trends);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching trends:", err);
    }
  }, []);

  const refreshAll = useCallback(async (skipCache: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        refreshStats(skipCache),
        refreshActivities(7, skipCache),
        refreshPerformance(skipCache),
        refreshTrends(trendPeriod, skipCache),
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
