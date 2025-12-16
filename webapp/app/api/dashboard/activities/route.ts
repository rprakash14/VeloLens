import { NextRequest, NextResponse } from "next/server";
import { subDays } from "date-fns";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "7");

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

    // Filter activities by date (last N days)
    const cutoffDate = subDays(new Date(), days);
    const filteredActivities = Array.isArray(activities)
      ? activities.filter((activity: any) => {
          return new Date(activity.start_date) > cutoffDate;
        })
      : [];

    return NextResponse.json({
      activities: filteredActivities,
    });
  } catch (error: any) {
    console.error("Activities API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
