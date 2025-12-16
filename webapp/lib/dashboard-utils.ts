import { format, subDays, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";

// US Eastern timezone
const TIMEZONE = "America/New_York";

// Format distance from meters to kilometers
export function formatDistance(meters: number): string {
  const km = meters / 1000;
  return km.toFixed(1) + " km";
}

// Format time from seconds to hours:minutes
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

// Format elevation in meters
export function formatElevation(meters: number): string {
  return Math.round(meters) + " m";
}

// Format pace (min/km) from average speed (m/s)
export function formatPace(speedMetersPerSecond: number): string {
  if (speedMetersPerSecond === 0) return "N/A";
  const minutesPerKm = 1000 / (speedMetersPerSecond * 60);
  const minutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
}

// Format speed from m/s to km/h
export function formatSpeed(speedMetersPerSecond: number): string {
  const kmh = (speedMetersPerSecond * 3.6);
  return kmh.toFixed(1) + " km/h";
}

// Get activity type emoji
export function getActivityEmoji(type: string): string {
  const emojiMap: Record<string, string> = {
    Ride: "🚴",
    Run: "🏃",
    Swim: "🏊",
    Walk: "🚶",
    Hike: "🥾",
    AlpineSki: "⛷️",
    BackcountrySki: "🎿",
    NordicSki: "⛷️",
    IceSkate: "⛸️",
    InlineSkate: "⛸️",
    Kitesurf: "🪁",
    RollerSki: "🎿",
    Windsurf: "🏄",
    Workout: "💪",
    Yoga: "🧘",
    WeightTraining: "🏋️",
  };
  return emojiMap[type] || "🏃";
}

// Get activity type color
export function getActivityColor(type: string): string {
  const colorMap: Record<string, string> = {
    Ride: "text-blue-600",
    Run: "text-orange-600",
    Swim: "text-cyan-600",
    Walk: "text-green-600",
    Hike: "text-emerald-600",
    Workout: "text-purple-600",
  };
  return colorMap[type] || "text-gray-600";
}

// Calculate date range for different periods
export function getDateRange(period: "week" | "month" | "year"): { start: Date; end: Date } {
  const end = new Date();
  let start: Date;

  switch (period) {
    case "week":
      start = startOfWeek(end);
      break;
    case "month":
      start = startOfMonth(end);
      break;
    case "year":
      start = startOfYear(end);
      break;
  }

  return { start, end };
}

// Format date for display (converts UTC to EST)
export function formatDate(dateString: string): string {
  return formatInTimeZone(new Date(dateString), TIMEZONE, "MMM d, yyyy 'at' h:mm a");
}

// Helper to convert UTC date to EST Date object
export function toESTDate(dateString: string): Date {
  return toZonedTime(new Date(dateString), TIMEZONE);
}

// Format date for chart labels (converts UTC to EST)
export function formatChartDate(dateString: string, period: "week" | "month" | "year"): string {
  const estDate = toZonedTime(new Date(dateString), TIMEZONE);

  switch (period) {
    case "week":
      return format(estDate, "EEE"); // Mon, Tue, etc.
    case "month":
      return format(estDate, "MMM d"); // Jan 1, etc.
    case "year":
      return format(estDate, "MMM"); // Jan, Feb, etc.
  }
}

// Calculate training load (simplified)
export function calculateTrainingLoad(activities: any[]): {
  acute: number;
  chronic: number;
  ratio: number;
} {
  const last7Days = activities.filter(
    (a) => new Date(a.start_date) > subDays(new Date(), 7)
  );
  const last28Days = activities.filter(
    (a) => new Date(a.start_date) > subDays(new Date(), 28)
  );

  const acuteLoad = last7Days.reduce((sum, a) => sum + (a.moving_time || 0), 0) / 3600; // hours
  const chronicLoad = last28Days.reduce((sum, a) => sum + (a.moving_time || 0), 0) / 3600 / 4; // avg hours per week

  const ratio = chronicLoad > 0 ? acuteLoad / chronicLoad : 0;

  return {
    acute: Math.round(acuteLoad * 10) / 10,
    chronic: Math.round(chronicLoad * 10) / 10,
    ratio: Math.round(ratio * 100) / 100,
  };
}

// Get zone color based on zone index
export function getZoneColor(index: number, total: number): string {
  const colors = [
    "bg-green-400",  // Zone 1: Easy
    "bg-yellow-400", // Zone 2: Moderate
    "bg-orange-400", // Zone 3: Tempo
    "bg-red-400",    // Zone 4: Threshold
    "bg-red-600",    // Zone 5: Max
  ];

  return colors[index] || "bg-gray-400";
}

// Check if activity is in last N days
export function isActivityInLastDays(activityDate: string, days: number): boolean {
  const cutoff = subDays(new Date(), days);
  return new Date(activityDate) > cutoff;
}
