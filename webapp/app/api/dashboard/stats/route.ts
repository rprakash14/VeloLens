import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json({
      recent: stats.recent_ride_totals || stats.recent_run_totals || {},
      ytd: stats.ytd_ride_totals || stats.ytd_run_totals || {},
      all_time: stats.all_ride_totals || stats.all_run_totals || {},
    });
  } catch (error: any) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
