import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  analyzeCv,
  analyzeOpportunity,
  type AnalyzerMode,
} from "@/lib/ai/analyzer";
import { extractCvText } from "@/lib/ai/cv-extractor";

export const dynamic = "force-dynamic";

type OpportunityPayload = {
  title?: string;
  company?: string;
  description?: string;
  experience?: string;
  skills?: string[];
  location?: string;
  remote?: boolean;
  salary?: string;
  source?: string;
};

type RequestBody = {
  mode?: AnalyzerMode;
  opportunity?: OpportunityPayload;
};

function isAnalyzerMode(value: unknown): value is AnalyzerMode {
  return value === "cv" || value === "opportunity";
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isUserScopedCvPath(userId: string, storagePath: string) {
  const segments = storagePath.split("/");

  return (
    segments.length === 3 &&
    segments[0] === userId &&
    segments[1] === "cv" &&
    segments.every((segment) => segment && segment !== "." && segment !== "..")
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as RequestBody;
    const mode = body.mode;

    if (!isAnalyzerMode(mode)) {
      return NextResponse.json(
        { error: "A valid analyzer mode is required" },
        { status: 400 },
      );
    }

    const opportunity = body.opportunity;

    if (mode === "opportunity") {
      if (!hasText(opportunity?.title) || !hasText(opportunity?.company)) {
        return NextResponse.json(
          { error: "A valid opportunity is required" },
          { status: 400 },
        );
      }
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "experience, skills, preferred_roles, work_preference, location, cv_file_name, cv_storage_path",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("AI profile lookup failed:", profileError.message);
      return NextResponse.json(
        { error: "Unable to load your profile" },
        { status: 500 },
      );
    }

    let cvText: string | undefined;

    if (profile?.cv_storage_path) {
      const ownedPath = profile.cv_storage_path;

      if (!isUserScopedCvPath(user.id, ownedPath)) {
        console.error("Rejected invalid CV storage path");
        return NextResponse.json(
          { error: "Your CV storage record is invalid" },
          { status: 500 },
        );
      }

      const { data: cvFile, error: downloadError } =
        await supabase.storage.from("cv-resumes").download(ownedPath);

      if (downloadError) {
        console.error("CV download failed:", downloadError.message);
        return NextResponse.json(
          { error: "Unable to read your uploaded CV" },
          { status: 500 },
        );
      }

      try {
        cvText = await extractCvText(
          await cvFile.arrayBuffer(),
          profile.cv_file_name || "resume.pdf",
        );
      } catch (error) {
        console.error(
          "CV extraction failed:",
          error instanceof Error ? error.message : "Unknown error",
        );

        return NextResponse.json(
          { error: "Unable to extract readable text from your CV" },
          { status: 422 },
        );
      }
    } else if (mode === "cv") {
      return NextResponse.json(
        { error: "CV analysis requires a CV upload" },
        { status: 400 },
      );
    }

    if (mode === "cv") {
      const result = await analyzeCv({ cvText: cvText! });

      return NextResponse.json({
        result,
        cvAnalyzed: true,
      });
    }

    const result = await analyzeOpportunity({
      cvText,
      opportunity: {
        title: opportunity!.title!,
        company: opportunity!.company!,
        description: opportunity!.description,
        experience: opportunity!.experience,
        skills: opportunity!.skills,
        location: opportunity!.location,
        remote: opportunity!.remote,
        salary: opportunity!.salary,
        source: opportunity!.source,
      },
      profile: profile
        ? {
            experience: profile.experience ?? undefined,
            skills: Array.isArray(profile.skills) ? profile.skills : [],
            preferredRoles: Array.isArray(profile.preferred_roles)
              ? profile.preferred_roles
              : [],
            workPreference: profile.work_preference ?? undefined,
            location: profile.location ?? undefined,
          }
        : undefined,
    });

    return NextResponse.json({
      result,
      cvAnalyzed: Boolean(cvText),
    });
  } catch (error) {
    console.error(
      "AI Analyzer error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      { error: "AI analysis is temporarily unavailable" },
      { status: 503 },
    );
  }
}
