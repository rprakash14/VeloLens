"use client";

import { useStravaData } from "@/contexts/StravaDataContext";
import StatCard from "./StatCard";

export default function SummaryStats() {
  const { stats, isLoading, error } = useStravaData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error loading stats: {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600 text-center">
        No stats available
      </div>
    );
  }

  const { recent, ytd, all_time } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="This Week"
        count={recent.count || 0}
        distance={recent.distance || 0}
        time={recent.moving_time || 0}
        elevation={recent.elevation_gain || 0}
      />
      <StatCard
        title="This Year"
        count={ytd.count || 0}
        distance={ytd.distance || 0}
        time={ytd.moving_time || 0}
        elevation={ytd.elevation_gain || 0}
      />
      <StatCard
        title="All Time"
        count={all_time.count || 0}
        distance={all_time.distance || 0}
        time={all_time.moving_time || 0}
        elevation={all_time.elevation_gain || 0}
      />
    </div>
  );
}
