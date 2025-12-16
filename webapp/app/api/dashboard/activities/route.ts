import { NextRequest, NextResponse } from "next/server";
import { subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import axios from "axios";
import cache, { CACHE_DURATIONS } from "@/lib/cache";

const TIMEZONE = "America/New_York";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "7");
    const skipCache = searchParams.get("skipCache") === "true";

    // Generate cache key
    const cacheKey = `activities:${days}`;

    // Check cache first (unless skipCache is true)
    if (!skipCache) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`[Cache HIT] ${cacheKey}`);
        return NextResponse.json(cachedData);
      }
      console.log(`[Cache MISS] ${cacheKey}`);
    }

    // Call Strava API directly to get activities
    const accessToken = process.env.STRAVA_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Strava access token not configured" },
        { status: 500 }
      );
    }

    const response = await axios.get(
      "https://www.strava.com/api/v3/athlete/activities",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          per_page: 30,
          page: 1,
        },
      }
    );

    const activities = response.data;

    // Filter activities by date (last N days in EST)
    const nowEST = toZonedTime(new Date(), TIMEZONE);
    const cutoffDate = subDays(nowEST, days);
    const filteredActivities = Array.isArray(activities)
      ? activities.filter((activity: any) => {
          const activityDateEST = toZonedTime(new Date(activity.start_date), TIMEZONE);
          return activityDateEST > cutoffDate;
        })
      : [];

    const result = {
      activities: filteredActivities,
    };

    // Cache the result
    cache.set(cacheKey, result, CACHE_DURATIONS.ACTIVITIES);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Activities API error:", error);

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
