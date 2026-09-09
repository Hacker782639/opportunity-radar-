import { NextRequest, NextResponse } from "next/server";
import { getAllJobs } from "@/lib/jobs/providers";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") ?? "";

  try {
    const result = await getAllJobs(search);

    return NextResponse.json({
      success: true,
      count: result.jobs.length,
      jobs: result.jobs,
      providers: result.providers,
    });
  } catch (error) {
    console.error("[Opportunity Radar] jobs route failed:", error);

    return NextResponse.json(
      {
        success: false,
        count: 0,
        jobs: [],
        providers: [],
        error: "Unable to load opportunities right now.",
      },
      { status: 502 },
    );
  }
}
