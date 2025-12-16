"use client";

import { useStravaData } from "@/contexts/StravaDataContext";
import {
  formatTime,
  formatDate,
  getActivityEmoji,
  getActivityColor,
} from "@/lib/dashboard-utils";
import { formatDistance, formatElevation } from "@/lib/units";

export default function ActivityFeed() {
  const { activities, isLoading, error, units } = useStravaData();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Recent Activities (Last 7 Days)
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Recent Activities (Last 7 Days)
        </h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading activities: {error}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Recent Activities (Last 7 Days)
        </h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600 text-center">
          <p className="text-4xl mb-2">🏃</p>
          <p>No activities in the last 7 days</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Recent Activities (Last 7 Days)
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{getActivityEmoji(activity.type)}</span>
                  <h4 className={`font-semibold ${getActivityColor(activity.type)}`}>
                    {activity.name}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {formatDate(activity.start_date)}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Distance: </span>
                    <span className="font-medium">
                      {formatDistance(activity.distance, units)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Time: </span>
                    <span className="font-medium">
                      {formatTime(activity.moving_time)}
                    </span>
                  </div>
                  {activity.total_elevation_gain > 0 && (
                    <div>
                      <span className="text-gray-600">Elevation: </span>
                      <span className="font-medium">
                        {formatElevation(activity.total_elevation_gain, units)}
                      </span>
                    </div>
                  )}
                  {activity.average_heartrate && (
                    <div>
                      <span className="text-gray-600">Avg HR: </span>
                      <span className="font-medium">
                        {Math.round(activity.average_heartrate)} bpm
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
