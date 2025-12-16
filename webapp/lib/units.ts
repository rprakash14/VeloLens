/**
 * Unit conversion utilities for metric/imperial display
 */

export type UnitSystem = "metric" | "imperial";

// Conversion constants
const METERS_TO_FEET = 3.28084;
const METERS_TO_MILES = 0.000621371;
const KM_TO_MILES = 0.621371;
const MPS_TO_MPH = 2.23694;

/**
 * Convert distance from meters to the specified unit system
 */
export function convertDistance(meters: number, units: UnitSystem): { value: number; unit: string } {
  if (units === "imperial") {
    const miles = meters * METERS_TO_MILES;
    return { value: miles, unit: "mi" };
  }

  const km = meters / 1000;
  return { value: km, unit: "km" };
}

/**
 * Convert elevation from meters to the specified unit system
 */
export function convertElevation(meters: number, units: UnitSystem): { value: number; unit: string } {
  if (units === "imperial") {
    const feet = meters * METERS_TO_FEET;
    return { value: feet, unit: "ft" };
  }

  return { value: meters, unit: "m" };
}

/**
 * Convert speed from m/s to the specified unit system
 */
export function convertSpeed(metersPerSecond: number, units: UnitSystem): { value: number; unit: string } {
  if (units === "imperial") {
    const mph = metersPerSecond * MPS_TO_MPH;
    return { value: mph, unit: "mph" };
  }

  const kmh = metersPerSecond * 3.6;
  return { value: kmh, unit: "km/h" };
}

/**
 * Convert pace (min/distance) - returns pace string
 */
export function convertPace(speedMetersPerSecond: number, units: UnitSystem): { value: string; unit: string } {
  if (speedMetersPerSecond === 0) {
    return { value: "N/A", unit: "" };
  }

  if (units === "imperial") {
    // min/mile
    const minutesPerMile = 1609.34 / (speedMetersPerSecond * 60);
    const minutes = Math.floor(minutesPerMile);
    const seconds = Math.round((minutesPerMile - minutes) * 60);
    return { value: `${minutes}:${seconds.toString().padStart(2, "0")}`, unit: "/mi" };
  }

  // min/km
  const minutesPerKm = 1000 / (speedMetersPerSecond * 60);
  const minutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - minutes) * 60);
  return { value: `${minutes}:${seconds.toString().padStart(2, "0")}`, unit: "/km" };
}

/**
 * Format distance with appropriate unit
 */
export function formatDistance(meters: number, units: UnitSystem, decimals: number = 1): string {
  const converted = convertDistance(meters, units);
  return `${converted.value.toFixed(decimals)} ${converted.unit}`;
}

/**
 * Format elevation with appropriate unit
 */
export function formatElevation(meters: number, units: UnitSystem, decimals: number = 0): string {
  const converted = convertElevation(meters, units);
  return `${Math.round(converted.value)} ${converted.unit}`;
}

/**
 * Format speed with appropriate unit
 */
export function formatSpeed(speedMetersPerSecond: number, units: UnitSystem, decimals: number = 1): string {
  const converted = convertSpeed(speedMetersPerSecond, units);
  return `${converted.value.toFixed(decimals)} ${converted.unit}`;
}

/**
 * Format pace with appropriate unit
 */
export function formatPace(speedMetersPerSecond: number, units: UnitSystem): string {
  const converted = convertPace(speedMetersPerSecond, units);
  if (converted.value === "N/A") return "N/A";
  return `${converted.value} ${converted.unit}`;
}
