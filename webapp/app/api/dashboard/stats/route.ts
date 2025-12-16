import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import cache, { CACHE_DURATIONS } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const skipCache = searchParams.get("skipCache") === "true";

    // Generate cache key
    const cacheKey = "stats";

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

    // Get athlete profile first to get athlete ID
    const profileResponse = await axios.get(
      "https://www.strava.com/api/v3/athlete",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const athleteId = profileResponse.data.id;

    // Get athlete stats
    const statsResponse = await axios.get(
      `https://www.strava.com/api/v3/athletes/${athleteId}/stats`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const stats = statsResponse.data;

    const result = {
      recent: stats.recent_ride_totals || stats.recent_run_totals || {},
      ytd: stats.ytd_ride_totals || stats.ytd_run_totals || {},
      all_time: stats.all_ride_totals || stats.all_run_totals || {},
    };

    // Cache the result
    cache.set(cacheKey, result, CACHE_DURATIONS.STATS);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Stats API error:", error);

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
