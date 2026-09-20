import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { extractCvText } from "@/lib/ai/cv-extractor";
import { extractProfileFromCv } from "@/lib/ai/profile-extractor";
import { CV_BUCKET, isUserScopedCvPath } from "@/lib/cv/client";

export const dynamic = "force-dynamic";

export async function POST() {
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("cv_file_name, cv_storage_path")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("CV profile lookup failed:", profileError.message);
      return NextResponse.json(
        { error: "Unable to load your profile" },
        { status: 500 },
      );
    }

    if (!profile?.cv_storage_path) {
      return NextResponse.json(
        { error: "CV extraction requires a CV upload" },
        { status: 400 },
      );
    }

    const storagePath = profile.cv_storage_path;

    if (!isUserScopedCvPath(user.id, storagePath)) {
      console.error("Rejected invalid CV storage path");
      return NextResponse.json(
        { error: "Your CV storage record is invalid" },
        { status: 500 },
      );
    }

    const { data: cvFile, error: downloadError } = await supabase.storage
      .from(CV_BUCKET)
      .download(storagePath);

    if (downloadError || !cvFile) {
      console.error(
        "CV download failed:",
        downloadError?.message ?? "No file returned",
      );
      return NextResponse.json(
        { error: "Unable to read your uploaded CV" },
        { status: 500 },
      );
    }

    let cvText: string;

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

    try {
      const extracted = await extractProfileFromCv({ cvText });

      return NextResponse.json({ profile: extracted, cvAnalyzed: true });
    } catch (error) {
      console.error(
        "CV profile extraction failed:",
        error instanceof Error ? error.message : "Unknown error",
      );

      return NextResponse.json(
        { error: "AI profile extraction is temporarily unavailable" },
        { status: 503 },
      );
    }
  } catch (error) {
    console.error(
      "CV profile extraction error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      { error: "AI profile extraction is temporarily unavailable" },
      { status: 503 },
    );
  }
}
