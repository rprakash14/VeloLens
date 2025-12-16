"use client";

import { useState } from "react";
import { useStravaData } from "@/contexts/StravaDataContext";
import { formatChartDate } from "@/lib/dashboard-utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendPeriod } from "@/types/strava";

export default function TrendCharts() {
  const { trends, trendPeriod, refreshTrends, isLoading, error } = useStravaData();
  const [selectedPeriod, setSelectedPeriod] = useState<TrendPeriod>(trendPeriod);

  const handlePeriodChange = async (period: TrendPeriod) => {
    setSelectedPeriod(period);
    await refreshTrends(period);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Activity Trends</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading trends: {error}
        </div>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Activity Trends</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600 text-center">
          No trend data available
        </div>
      </div>
    );
  }

  // Prepare chart data with formatted labels
  const chartData = trends.map((point) => ({
    ...point,
    label: formatChartDate(point.date, selectedPeriod),
    distanceKm: (point.distance / 1000).toFixed(1),
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Activity Trends</h3>
        <div className="flex gap-2">
          <button
            onClick={() => handlePeriodChange("week")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedPeriod === "week"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => handlePeriodChange("month")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedPeriod === "month"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => handlePeriodChange("year")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedPeriod === "year"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Year
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Distance Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Distance (km)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => `${value} km`}
                labelStyle={{ color: "#374151" }}
              />
              <Line
                type="monotone"
                dataKey="distanceKm"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: "#f97316", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Elevation Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Elevation Gain (m)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => `${Math.round(value)} m`}
                labelStyle={{ color: "#374151" }}
              />
              <Bar dataKey="elevation" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Count Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Activity Count</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip labelStyle={{ color: "#374151" }} />
              <Area
                type="monotone"
                dataKey="activity_count"
                stroke="#8b5cf6"
                fill="#c4b5fd"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
