import { NextRequest, NextResponse } from "next/server";
import { toZonedTime } from "date-fns-tz";
import axios from "axios";
import cache, { CACHE_DURATIONS } from "@/lib/cache";

const TIMEZONE = "America/New_York";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const skipCache = searchParams.get("skipCache") === "true";

    // Generate cache key
    const cacheKey = "performance";

    // Check cache first (unless skipCache is true)
    if (!skipCache) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`[Cache HIT] ${cacheKey}`);
        return NextResponse.json(cachedData);
      }
      console.log(`[Cache MISS] ${cacheKey}`);
    }

    const accessToken = process.env.STRAVA_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Strava access token not configured" },
        { status: 500 }
      );
    }

    // Get athlete zones
    const zonesResponse = await axios.get(
      "https://www.strava.com/api/v3/athlete/zones",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Get recent activities for training load calculation
    const activitiesResponse = await axios.get(
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

    const zones = zonesResponse.data;
    const activities = activitiesResponse.data;

    const hrZones = zones.heart_rate?.zones || [];
    const powerZones = zones.power?.zones || [];

    // Calculate training load
    let trainingLoad = { acute: 0, chronic: 0, ratio: 0 };

    if (Array.isArray(activities)) {
      // Calculate last 7 days (acute) vs last 28 days (chronic) in EST
      const nowEST = toZonedTime(new Date(), TIMEZONE);
      const last7Days = activities.filter((a: any) => {
        const activityEST = toZonedTime(new Date(a.start_date), TIMEZONE);
        return (nowEST.getTime() - activityEST.getTime()) / (1000 * 60 * 60 * 24) <= 7;
      });
      const last28Days = activities.filter((a: any) => {
        const activityEST = toZonedTime(new Date(a.start_date), TIMEZONE);
        return (nowEST.getTime() - activityEST.getTime()) / (1000 * 60 * 60 * 24) <= 28;
      });

      const acuteLoad =
        last7Days.reduce((sum: number, a: any) => sum + (a.moving_time || 0), 0) /
        3600;
      const chronicLoad =
        last28Days.reduce((sum: number, a: any) => sum + (a.moving_time || 0), 0) /
        3600 /
        4;

      trainingLoad = {
        acute: Math.round(acuteLoad * 10) / 10,
        chronic: Math.round(chronicLoad * 10) / 10,
        ratio: chronicLoad > 0 ? Math.round((acuteLoad / chronicLoad) * 100) / 100 : 0,
      };
    }

    const result = {
      hrZones,
      powerZones,
      trainingLoad,
    };

    // Cache the result
    cache.set(cacheKey, result, CACHE_DURATIONS.PERFORMANCE);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Performance API error:", error);

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
