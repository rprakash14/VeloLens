"use client";

import { useStravaData } from "@/contexts/StravaDataContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function PerformanceMetrics() {
  const { performance, isLoading, error } = useStravaData();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance Metrics</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading performance: {error}
        </div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance Metrics</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600 text-center">
          No performance data available
        </div>
      </div>
    );
  }

  const { hrZones, powerZones, trainingLoad } = performance;

  // Prepare HR zones data for chart
  const hrZonesData = hrZones.map((zone, index) => ({
    name: `Zone ${index + 1}`,
    time: zone.time || 0,
    range: `${zone.min}-${zone.max}`,
  }));

  // Prepare Power zones data for chart
  const powerZonesData = powerZones.map((zone, index) => ({
    name: `Zone ${index + 1}`,
    time: zone.time || 0,
    range: `${zone.min}-${zone.max}W`,
  }));

  const zoneColors = ["#4ade80", "#facc15", "#fb923c", "#ef4444", "#dc2626"];

  const hasHRZones = hrZones.length > 0;
  const hasPowerZones = powerZones.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance Metrics</h3>

      {/* Training Load */}
      <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Training Load</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-orange-600">{trainingLoad.acute}h</p>
            <p className="text-xs text-gray-600">Acute (7 days)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{trainingLoad.chronic}h</p>
            <p className="text-xs text-gray-600">Chronic (28 days)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{trainingLoad.ratio}</p>
            <p className="text-xs text-gray-600">Ratio</p>
          </div>
        </div>
      </div>

      {/* Heart Rate Zones */}
      {hasHRZones ? (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Heart Rate Zones</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hrZonesData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={60} />
              <Tooltip
                formatter={(value: number) => `${Math.round(value / 60)} min`}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="time" radius={[0, 8, 8, 0]}>
                {hrZonesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={zoneColors[index % zoneColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
          No heart rate zone data available
        </div>
      )}

      {/* Power Zones */}
      {hasPowerZones ? (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Power Zones</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={powerZonesData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={60} />
              <Tooltip
                formatter={(value: number) => `${Math.round(value / 60)} min`}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="time" radius={[0, 8, 8, 0]}>
                {powerZonesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={zoneColors[index % zoneColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
          No power zone data available
        </div>
      )}
    </div>
  );
}
