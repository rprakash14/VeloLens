import { formatDistance, formatTime, formatElevation } from "@/lib/dashboard-utils";

interface StatCardProps {
  title: string;
  count: number;
  distance: number;
  time: number;
  elevation: number;
}

export default function StatCard({ title, count, distance, time, elevation }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-orange-500">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Activities</span>
          <span className="text-xl font-bold text-orange-600">{count}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Distance</span>
          <span className="text-lg font-semibold text-gray-800">
            {formatDistance(distance)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Time</span>
          <span className="text-lg font-semibold text-gray-800">
            {formatTime(time)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Elevation</span>
          <span className="text-lg font-semibold text-gray-800">
            {formatElevation(elevation)}
          </span>
        </div>
      </div>
    </div>
  );
}
