import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  getJobMatch,
  type MatchResult,
  type MatchingProfile,
} from "@/lib/jobs/matching";
import { getJobById } from "@/lib/jobs/providers";
import type { Job } from "@/lib/jobs/types";

import { OpportunityDetail } from "./opportunity-detail";

function hasMatchingProfileData(profile: MatchingProfile) {
  return Boolean(
    profile.skills?.length ||
      profile.preferred_roles?.length ||
      profile.opportunity_types?.length ||
      profile.experience ||
      profile.work_preference ||
      profile.location,
  );
}

type SavedOpportunityRecord = {
  opportunity_id: string;
  title: string;
  company: string | null;
  location: string | null;
  remote: boolean | null;
  experience: string | null;
  salary: string | null;
  url: string | null;
  source: string | null;
  published_at: string | null;
  skills: string[] | null;
};

type ApplicationRecord = {
  opportunity_id: string;
  title: string;
  company: string | null;
  location: string | null;
  url: string | null;
  source: string | null;
};

function getSavedJob(record: SavedOpportunityRecord): Job | null {
  if (!record.url || !record.source) return null;

  return {
    id: record.opportunity_id,
    title: record.title,
    company: record.company || "Company not listed",
    location: record.location || "Location not listed",
    remote: record.remote ?? false,
    experience: record.experience || "Not listed",
    salary: record.salary || undefined,
    url: record.url,
    source: record.source,
    publishedAt: record.published_at || undefined,
    skills: record.skills ?? [],
  };
}

function getAppliedJob(record: ApplicationRecord): Job | null {
  if (!record.url || !record.source) return null;

  return {
    id: record.opportunity_id,
    title: record.title,
    company: record.company || "Company not listed",
    location: record.location || "Location not listed",
    remote: false,
    experience: "Not listed",
    url: record.url,
    source: record.source,
    skills: [],
  };
}

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: opportunityId } = await params;
  const liveJob = await getJobById(opportunityId);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let job = liveJob;

  if (!job && user) {
    const [savedResult, applicationResult] = await Promise.all([
      supabase
        .from("saved_opportunities")
        .select(
          "opportunity_id, title, company, location, remote, experience, salary, url, source, published_at, skills",
        )
        .eq("user_id", user.id)
        .eq("opportunity_id", opportunityId)
        .maybeSingle(),
      supabase
        .from("applications")
        .select("opportunity_id, title, company, location, url, source")
        .eq("user_id", user.id)
        .eq("opportunity_id", opportunityId)
        .maybeSingle(),
    ]);

    const savedJob = savedResult.data
      ? getSavedJob(savedResult.data)
      : null;
    const appliedJob = applicationResult.data
      ? getAppliedJob(applicationResult.data)
      : null;

    const fallbackJob = savedJob ?? appliedJob;

    if (fallbackJob) {
      job = fallbackJob;
    }
  }

  if (!job) {
    notFound();
  }

  const resolvedJob: Job = job;

  let initialMatch: MatchResult | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "skills, preferred_roles, opportunity_types, experience, work_preference, location",
      )
      .eq("id", user.id)
      .maybeSingle();

    const matchingProfile: MatchingProfile = {
      skills: profile?.skills ?? [],
      preferred_roles: profile?.preferred_roles ?? [],
      opportunity_types: profile?.opportunity_types ?? [],
      experience: profile?.experience ?? null,
      work_preference: profile?.work_preference ?? null,
      location: profile?.location ?? null,
    };

    if (hasMatchingProfileData(matchingProfile)) {
      initialMatch = getJobMatch(resolvedJob, matchingProfile);
    }
  }

  return (
    <OpportunityDetail
      initialJob={resolvedJob}
      initialMatch={initialMatch}
      opportunityId={opportunityId}
    />
  );
}
