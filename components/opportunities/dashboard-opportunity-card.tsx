"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import {
  getOpportunityType,
} from "@/lib/jobs/matching";
import type { Job } from "@/lib/jobs/types";
import { OpportunityCard } from "./opportunity-card";

type DashboardOpportunityCardProps = {
  job: Job;
  matchScore: number;
  saved: boolean;
};

export function DashboardOpportunityCard({
  job,
  matchScore,
  saved: initialSaved,
}: DashboardOpportunityCardProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);

  const toggleSave = async () => {
    if (saving) return;

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      if (saved) {
        const { error } = await supabase
          .from("saved_opportunities")
          .delete()
          .eq("user_id", user.id)
          .eq("opportunity_id", job.id);

        if (error) {
          console.error("Remove saved opportunity error:", error);
        } else {
          setSaved(false);
        }

        return;
      }

      const { error } = await supabase.from("saved_opportunities").insert({
        user_id: user.id,
        opportunity_id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        remote: job.remote,
        experience: job.experience,
        salary: job.salary ?? null,
        url: job.url,
        source: job.source,
        published_at: job.publishedAt
          ? new Date(job.publishedAt).toISOString()
          : null,
        skills: job.skills ?? [],
      });

      if (error) {
        console.error("Save opportunity error:", error);
      } else {
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <OpportunityCard
      title={job.title}
      organization={job.company}
      type={getOpportunityType(job)}
      location={job.remote ? `Remote · ${job.location}` : job.location}
      experience={job.experience}
      salary={job.salary ?? "Salary not listed"}
      postedAt={job.publishedAt}
      matchScore={matchScore}
      skills={job.skills.slice(0, 4)}
      saved={saved}
      onSave={toggleSave}
      onView={() =>
        router.push(`/opportunities/${encodeURIComponent(job.id)}`)
      }
    />
  );
}
