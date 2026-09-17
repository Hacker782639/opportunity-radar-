"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Flame,
  Loader2,
  MapPin,
  Sparkles,
  Target,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/client";
import type { Job } from "@/lib/jobs/types";
import {
  getJobMatch,
  getOpportunityType,
  type MatchingProfile,
} from "@/lib/jobs/matching";

type ApplicationState = {
  id: string;
  opportunity_id: string;
  status: string;
};

export default function ForYouPage() {
  const supabase = useMemo(() => createClient(), []);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<MatchingProfile>({});
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<ApplicationState[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [minimumMatch, setMinimumMatch] = useState(60);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadUserData = async () => {
      setLoadingUser(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !active) return;

        const [profileResult, savedResult, applicationResult] =
          await Promise.all([
            supabase
              .from("profiles")
              .select(
                "skills, preferred_roles, opportunity_types, experience, work_preference, location",
              )
              .eq("id", user.id)
              .maybeSingle(),

            supabase
              .from("saved_opportunities")
              .select("opportunity_id")
              .eq("user_id", user.id),

            supabase
              .from("applications")
              .select("id, opportunity_id, status")
              .eq("user_id", user.id),
          ]);

        if (!active) return;

        if (
          profileResult.error ||
          savedResult.error ||
          applicationResult.error
        ) {
          console.error(
            "For You user lookup error:",
            profileResult.error ??
              savedResult.error ??
              applicationResult.error,
          );
          setError(
            "Unable to load your profile and saved opportunities.",
          );
          return;
        }

        setProfile(profileResult.data ?? {});
        setSavedIds(
          savedResult.data?.map((item) => item.opportunity_id) ?? [],
        );
        setApplications(applicationResult.data ?? []);
      } catch (err) {
        console.error("For You user lookup error:", err);
        setError("Unable to load your profile and saved opportunities.");
      } finally {
        if (active) setLoadingUser(false);
      }
    };

    loadUserData();

    return () => {
      active = false;
    };
  }, [supabase]);

  useEffect(() => {
    let active = true;

    const loadJobs = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/jobs", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load opportunities.");
        }

        if (active) {
          setJobs(data.jobs ?? []);
        }
      } catch (err) {
        console.error("For You jobs error:", err);

        if (active) {
          setError("Unable to load opportunities right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      active = false;
    };
  }, []);

  const ranked = useMemo(
    () =>
      jobs
        .map((job) => ({
          job,
          match: getJobMatch(job, profile),
        }))
        .sort(
          (a, b) =>
            b.match.score - a.match.score ||
            a.job.title.localeCompare(b.job.title),
        ),
    [jobs, profile],
  );

  const filtered = useMemo(
    () => ranked.filter((item) => item.match.score >= minimumMatch),
    [ranked, minimumMatch],
  );

  const applicationMap = useMemo(
    () =>
      new Map(
        applications.map((application) => [
          application.opportunity_id,
          application,
        ]),
      ),
    [applications],
  );

  const toggleSaved = async (job: Job) => {
    if (savingId) return;

    setSavingId(job.id);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const isSaved = savedIds.includes(job.id);

      if (isSaved) {
        const { error: saveError } = await supabase
          .from("saved_opportunities")
          .delete()
          .eq("user_id", user.id)
          .eq("opportunity_id", job.id);

        if (saveError) {
          console.error("Remove saved opportunity error:", saveError);
          return;
        }

        setSavedIds((current) =>
          current.filter((id) => id !== job.id),
        );
        return;
      }

      const { error: saveError } = await supabase
        .from("saved_opportunities")
        .insert({
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

      if (saveError) {
        console.error("Save opportunity error:", saveError);
        return;
      }

      setSavedIds((current) =>
        current.includes(job.id) ? current : [...current, job.id],
      );
    } finally {
      setSavingId(null);
    }
  };

  const applyToOpportunity = async (job: Job, matchScore: number) => {
    if (applyingId || applicationMap.has(job.id)) return;

    setApplyingId(job.id);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data, error: applicationError } = await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          opportunity_id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          url: job.url,
          source: job.source,
          match_score: matchScore,
          deadline: job.deadline ?? null,
          status: "Applied",
          next_step: "Apply on the original job site",
          applied_at: new Date().toISOString(),
        })
        .select("id, opportunity_id, status")
        .single();

      if (applicationError) {
        if (applicationError.code === "23505") {
          const { data: existing } = await supabase
            .from("applications")
            .select("id, opportunity_id, status")
            .eq("user_id", user.id)
            .eq("opportunity_id", job.id)
            .maybeSingle();

          if (existing) {
            setApplications((current) => [
              ...current.filter(
                (item) => item.opportunity_id !== job.id,
              ),
              existing,
            ]);
          }

          return;
        }

        console.error("Apply error:", applicationError);
        return;
      }

      if (data) {
        setApplications((current) => [
          ...current.filter((item) => item.opportunity_id !== job.id),
          data,
        ]);
      }
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Sparkles className="h-3.5 w-3.5" />
              Personalized radar
            </div>

            <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  For You
                </h1>
                <p className="mt-1.5 max-w-xl text-sm text-neutral-500 dark:text-neutral-400">
                  Opportunities ranked around your skills, experience,
                  interests, and preferences.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 dark:border-violet-500/20 dark:bg-violet-500/10">
                <Target className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                  Radar optimized
                </span>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-2 text-neutral-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                  Strong matches
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {ranked.filter((item) => item.match.score >= 90).length}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-2 text-neutral-400">
                <Flame className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                  Best match
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {loading ? "—" : `${ranked[0]?.match.score ?? 0}%`}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-2 text-neutral-400">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                  Opportunities
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {filtered.length}
              </p>
            </div>
          </section>

          <section className="mt-8 flex flex-col gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold">Recommended for you</h2>
              <p className="mt-1 text-xs text-neutral-400">
                Ranked by estimated fit.
              </p>
            </div>

            <label className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
              Minimum match
              <select
                value={minimumMatch}
                onChange={(event) =>
                  setMinimumMatch(Number(event.target.value))
                }
                className="h-8 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-semibold text-neutral-700 outline-none focus:border-violet-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
              >
                <option value={60}>60%+</option>
                <option value={70}>70%+</option>
                <option value={80}>80%+</option>
                <option value={90}>90%+</option>
                <option value={95}>95%+</option>
              </select>
            </label>
          </section>

          <section className="mt-4 space-y-3">
            {!loading &&
              !error &&
              filtered.map(({ job, match }) => {
                const isSaved = savedIds.includes(job.id);
                const application = applicationMap.get(job.id);
                const isApplied = Boolean(application);
                const isApplying = applyingId === job.id;

                const reason = match.reasons.length
                  ? match.reasons.join(" · ")
                  : match.matchedSkills.length
                    ? `Matches ${match.matchedSkills.length} of your relevant skills.`
                    : "No specific match reasons are available for this opportunity.";

                return (
                  <article
                    key={job.id}
                    className="rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-5"
                  >
                    <div className="flex gap-4">
                      <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 sm:flex">
                        <BriefcaseBusiness className="h-[18px] w-[18px]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-bold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300">
                                {getOpportunityType(job)}
                              </span>

                              <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
                                <Sparkles className="h-3 w-3" />
                                {match.score}% match
                              </span>

                              {isApplied && (
                                <span className="rounded-md bg-neutral-950 px-2 py-1 text-[10px] font-bold text-white dark:bg-white dark:text-neutral-950">
                                  {application?.status ?? "Applied"}
                                </span>
                              )}
                            </div>

                            <h3 className="mt-2 text-[16px] font-bold tracking-tight">
                              {job.title}
                            </h3>

                            <p className="mt-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                              {job.company}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={savingId === job.id}
                            onClick={() => toggleSaved(job)}
                            className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                              isSaved
                                ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400"
                                : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300"
                            }`}
                          >
                            {savingId === job.id
                              ? "Saving..."
                              : isSaved
                                ? "Saved"
                                : "Save"}
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location || "Location not listed"}
                          </span>
                          <span className="text-neutral-300 dark:text-neutral-700">
                            ·
                          </span>
                          <span>{job.experience || "Experience not listed"}</span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {job.skills.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                            >
                              <Check className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 flex flex-col gap-3 border-t border-neutral-100 pt-3 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
                          <p className="max-w-2xl text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                              Why it matches:
                            </span>{" "}
                            {reason}
                          </p>

                          <div className="flex shrink-0 items-center gap-3">
                            <button
                              type="button"
                              disabled={isApplied || isApplying}
                              onClick={() =>
                                applyToOpportunity(job, match.score)
                              }
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                isApplied
                                  ? "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                                  : "bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                              }`}
                            >
                              {isApplying
                                ? "Applying..."
                                : isApplied
                                  ? "Applied"
                                  : "Apply"}
                            </button>

                            <a
                              href={`/opportunities/${encodeURIComponent(job.id)}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-violet-600 dark:text-neutral-300 dark:hover:text-violet-400"
                            >
                              View
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
          </section>

          {(loading || loadingUser || error || filtered.length === 0) && (
            <div className="mt-4 rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center dark:border-neutral-700 dark:bg-neutral-900">
              {loading || loadingUser ? (
                <>
                  <Loader2 className="mx-auto h-7 w-7 animate-spin text-neutral-300 dark:text-neutral-600" />
                  <h3 className="mt-3 text-sm font-bold">
                    Loading your radar
                  </h3>
                  <p className="mt-1 text-xs text-neutral-400">
                    Loading your profile and live opportunities.
                  </p>
                </>
              ) : error ? (
                <>
                  <Target className="mx-auto h-7 w-7 text-neutral-300 dark:text-neutral-600" />
                  <h3 className="mt-3 text-sm font-bold">
                    Live opportunities unavailable
                  </h3>
                  <p className="mt-1 text-xs text-neutral-400">
                    {error}
                  </p>
                </>
              ) : (
                <>
                  <Target className="mx-auto h-7 w-7 text-neutral-300 dark:text-neutral-600" />
                  <h3 className="mt-3 text-sm font-bold">
                    No matches at this level
                  </h3>
                  <p className="mt-1 text-xs text-neutral-400">
                    Lower the minimum match score to see more opportunities.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
