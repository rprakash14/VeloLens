"use client";

import { useEffect } from "react";
import { useStravaData } from "@/contexts/StravaDataContext";
import SummaryStats from "./SummaryStats";
import ActivityFeed from "./ActivityFeed";
import PerformanceMetrics from "./PerformanceMetrics";
import TrendCharts from "./TrendCharts";

export default function Dashboard() {
  const { refreshAll, isLoading, units, toggleUnits } = useStravaData();

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm opacity-90">Your Strava activity analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleUnits}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              title={`Switch to ${units === "metric" ? "Imperial" : "Metric"}`}
            >
              <span className="text-sm">{units === "metric" ? "km" : "mi"}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </button>
            <button
              onClick={() => refreshAll(true)}
              disabled={isLoading}
              className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <svg
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <section>
          <SummaryStats />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ActivityFeed />
          <PerformanceMetrics />
        </section>

        <section>
          <TrendCharts />
        </section>
      </div>
    </div>
  );
}
