import { NextRequest, NextResponse } from "next/server";
import { getAllJobs, getJobById } from "@/lib/jobs/providers";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") ?? "";
  const id = request.nextUrl.searchParams.get("id");

  try {
    if (id) {
      const job = await getJobById(id);

      if (!job) {
        return NextResponse.json(
          { success: false, error: "Opportunity not found." },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, job });
    }

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
