import { NextRequest, NextResponse } from "next/server";
import { format, subDays, subMonths, subYears, eachDayOfInterval, eachMonthOfInterval } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import axios from "axios";

const TIMEZONE = "America/New_York";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "week";

    const accessToken = process.env.STRAVA_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Strava access token not configured" },
        { status: 500 }
      );
    }

    // Determine date range based on period
    const endDate = new Date();
    let startDate: Date;
    let dateFormat: string;

    switch (period) {
      case "week":
        startDate = subDays(endDate, 7);
        dateFormat = "yyyy-MM-dd";
        break;
      case "month":
        startDate = subMonths(endDate, 1);
        dateFormat = "yyyy-MM-dd";
        break;
      case "year":
        startDate = subYears(endDate, 1);
        dateFormat = "yyyy-MM";
        break;
      default:
        startDate = subDays(endDate, 7);
        dateFormat = "yyyy-MM-dd";
    }

    // Get activities from Strava API
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    const response = await axios.get(
      "https://www.strava.com/api/v3/athlete/activities",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          after: startTimestamp,
          before: endTimestamp,
          per_page: 200,
          page: 1,
        },
      }
    );

    const activities = response.data;

    // Aggregate activities by date (convert UTC to EST)
    const trendsMap = new Map<string, { distance: number; elevation: number; count: number }>();

    if (Array.isArray(activities)) {
      activities.forEach((activity: any) => {
        const utcDate = new Date(activity.start_date);
        const estDate = toZonedTime(utcDate, TIMEZONE);
        const dateKey = format(estDate, dateFormat);

        const existing = trendsMap.get(dateKey) || { distance: 0, elevation: 0, count: 0 };

        trendsMap.set(dateKey, {
          distance: existing.distance + (activity.distance || 0),
          elevation: existing.elevation + (activity.total_elevation_gain || 0),
          count: existing.count + 1,
        });
      });
    }

    // Generate all dates in range (even if no activities)
    let dateInterval;
    if (period === "year") {
      dateInterval = eachMonthOfInterval({ start: startDate, end: endDate });
    } else {
      dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    }

    const trends = dateInterval.map((date) => {
      const dateKey = format(date, dateFormat);
      const data = trendsMap.get(dateKey) || { distance: 0, elevation: 0, count: 0 };

      return {
        date: dateKey,
        distance: data.distance,
        elevation: data.elevation,
        activity_count: data.count,
      };
    });

    return NextResponse.json({ trends });
  } catch (error: any) {
    console.error("Trends API error:", error);

    // Handle Strava rate limiting
    if (error.response?.status === 429) {
      return NextResponse.json(
        { error: "Strava API rate limit exceeded. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
