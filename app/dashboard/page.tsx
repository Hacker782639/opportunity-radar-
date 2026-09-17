import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Clock3,
  Flame,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { DashboardOpportunityCard } from "@/components/opportunities/dashboard-opportunity-card";
import { Card } from "@/components/ui/card";
import { getAllJobs } from "@/lib/jobs/providers";
import { getJobMatch, type MatchingProfile } from "@/lib/jobs/matching";
import { calculateProfileStrength } from "@/lib/profile/strength";
import type { Job } from "@/lib/jobs/types";

function formatDaysLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

function getDeadlineDot(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days <= 3) return "bg-red-500";
  if (days <= 7) return "bg-amber-500";
  return "bg-neutral-300 dark:bg-neutral-600";
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error: profileError } = user
    ? await supabase
        .from("profiles")
        .select(
          "full_name, location, experience, skills, preferred_roles, opportunity_types, work_preference, onboarding_completed",
        )
        .eq("id", user.id)
        .maybeSingle()
    : { data: null, error: null };

  if (profileError) {
    throw profileError;
  }

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "there";

  const matchingProfile: MatchingProfile = {
    skills: profile?.skills ?? [],
    preferred_roles: profile?.preferred_roles ?? [],
    opportunity_types: profile?.opportunity_types ?? [],
    experience: profile?.experience ?? null,
    work_preference: profile?.work_preference ?? null,
    location: profile?.location ?? null,
  };

  const [
    jobsResult,
    savedResult,
    applicationsResult,
    deadlinesResult,
  ] = await Promise.all([
    getAllJobs(),
    user
      ? supabase
          .from("saved_opportunities")
          .select("opportunity_id", { count: "exact" })
          .eq("user_id", user.id)
      : Promise.resolve({
          count: 0,
          data: [] as { opportunity_id: string }[],
          error: null,
        }),
    user
      ? supabase
          .from("applications")
          .select("status")
          .eq("user_id", user.id)
      : Promise.resolve({ data: [], error: null }),
    user
      ? supabase
          .from("applications")
          .select("id, title, company, deadline, opportunity_id")
          .eq("user_id", user.id)
          .not("deadline", "is", null)
          .neq("status", "Rejected")
          .order("deadline", { ascending: true })
          .limit(3)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (
    savedResult.error ||
    applicationsResult.error ||
    deadlinesResult.error
  ) {
    throw (
      savedResult.error ??
      applicationsResult.error ??
      deadlinesResult.error
    );
  }

  const jobs: Job[] = jobsResult.jobs;

  const rankedJobs = jobs
    .map((job) => ({
      job,
      match: getJobMatch(job, matchingProfile),
    }))
    .sort((a, b) => {
      if (b.match.score !== a.match.score) {
        return b.match.score - a.match.score;
      }

      const aDate = a.job.publishedAt
        ? new Date(a.job.publishedAt).getTime()
        : 0;
      const bDate = b.job.publishedAt
        ? new Date(b.job.publishedAt).getTime()
        : 0;

      return bDate - aDate;
    });

  const strongestMatches = rankedJobs.slice(0, 3);

  const matchedJobs = rankedJobs.filter((item) => item.match.score >= 70);

  const matchQuality =
    strongestMatches.length > 0
      ? Math.round(
          strongestMatches.reduce(
            (total, item) => total + item.match.score,
            0,
          ) / strongestMatches.length,
        )
      : 0;

  const applications = applicationsResult.data ?? [];

  const savedIds =
    savedResult.data?.map((item) => item.opportunity_id) ?? [];
  const savedCount = savedResult.count ?? savedIds.length;
  const applicationCount = applications.length;

  const appliedCount = applications.filter(
    (application) => application.status === "Applied",
  ).length;

  const interviewCount = applications.filter(
    (application) => application.status === "Interview",
  ).length;

  const offerCount = applications.filter(
    (application) => application.status === "Offer",
  ).length;

  const deadlineItems = deadlinesResult.data ?? [];
  const deadlineCount = deadlineItems.length;

  const profileStrength = calculateProfileStrength({
    full_name: profile?.full_name,
    location: profile?.location,
    experience: profile?.experience,
    skills: profile?.skills,
    preferred_roles: profile?.preferred_roles,
    opportunity_types: profile?.opportunity_types,
    work_preference: profile?.work_preference,
  });

  const stats = [
    {
      label: "New matches",
      value: String(matchedJobs.length),
      detail: `${jobs.length} scanned`,
      icon: Sparkles,
    },
    {
      label: "Saved",
      value: String(savedCount),
      detail: "Your opportunities",
      icon: Bookmark,
    },
    {
      label: "Applications",
      value: String(applicationCount),
      detail: `${interviewCount} in interview`,
      icon: BriefcaseBusiness,
    },
    {
      label: "Deadlines",
      value: String(deadlineCount),
      detail: "Upcoming",
      icon: CalendarDays,
    },
  ];

  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* PAGE HEADER */}
          <section className="flex flex-col gap-5 border-b border-neutral-200 pb-6 dark:border-neutral-800 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>Workspace</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-neutral-700 dark:text-neutral-300">
                  Overview
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Your radar
              </h1>

              <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                The opportunities most relevant to you right now.
              </p>
            </div>

            <Link
              href="/discover"
              className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              <Search className="h-4 w-4" />
              Discover
            </Link>
          </section>

          {/* RADAR STATUS */}
          <section className="mt-6">
            <Card className="overflow-hidden border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                    <Target className="h-5 w-5" />
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-neutral-900" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-bold">
                        Radar is active
                      </h2>

                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        LIVE
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                      Scanning live opportunities against your current profile.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-neutral-200 dark:divide-neutral-800">
                  <div className="px-4 first:pl-0">
                    <p className="text-lg font-bold">
                      {jobs.length.toLocaleString()}
                    </p>
                    <p className="mt-0.5 whitespace-nowrap text-[10px] text-neutral-400">
                      scanned
                    </p>
                  </div>

                  <div className="px-4">
                    <p className="text-lg font-bold">
                      {matchedJobs.length}
                    </p>
                    <p className="mt-0.5 whitespace-nowrap text-[10px] text-neutral-400">
                      matches
                    </p>
                  </div>

                  <div className="px-4 last:pr-0">
                    <p className="text-lg font-bold">
                      {matchQuality}%
                    </p>
                    <p className="mt-0.5 whitespace-nowrap text-[10px] text-neutral-400">
                      match quality
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
                >
                  Tune radar
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          </section>

          {/* STATS */}
          <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <Card
                  key={stat.label}
                  className="border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      {stat.label}
                    </span>

                    <Icon className="h-4 w-4 text-neutral-400" />
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-2">
                    <span className="text-2xl font-bold tracking-tight">
                      {stat.value}
                    </span>

                    <span className="text-[10px] font-medium text-neutral-400">
                      {stat.detail}
                    </span>
                  </div>
                </Card>
              );
            })}
          </section>

          {/* MAIN GRID */}
          <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            {/* MATCHES */}
            <div className="min-w-0">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-neutral-950 dark:text-white" />

                    <h2 className="text-base font-bold">
                      Strongest matches
                    </h2>
                  </div>

                  <p className="mt-1 text-xs text-neutral-400">
                    Ranked by fit, relevance and freshness.
                  </p>
                </div>

                <Link
                  href="/discover"
                  className="hidden items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-950 sm:flex dark:hover:text-white"
                >
                  View all
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {strongestMatches.map(({ job, match }) => (
                  <DashboardOpportunityCard
                    key={job.id}
                    job={job}
                    matchScore={match.score}
                    saved={savedIds.includes(job.id)}
                  />
                ))}

                {strongestMatches.length === 0 && (
                  <Card className="border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <p className="text-sm font-semibold">
                      No opportunities available right now.
                    </p>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Try Discover again in a moment.
                    </p>
                  </Card>
                )}
              </div>
            </div>

            {/* RIGHT RAIL */}
            <aside className="space-y-4">
              {/* PROFILE */}
              <Card className="border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                      Profile
                    </p>

                    <h3 className="mt-1 text-sm font-bold">
                      Match strength
                    </h3>
                  </div>

                  <span className="text-lg font-bold">
                    {profileStrength}%
                  </span>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-neutral-950 dark:bg-white"
                    style={{ width: `${profileStrength}%` }}
                  />
                </div>

                <p className="mt-4 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                  {displayName
                    ? `${displayName.split(" ")[0]}, complete your profile to improve your matches.`
                    : "Complete your profile to improve your matches."}
                </p>

                <Link
                  href="/profile"
                  className="mt-4 inline-flex text-xs font-bold text-neutral-950 hover:text-neutral-600 dark:text-white dark:hover:text-neutral-300"
                >
                  Improve profile →
                </Link>
              </Card>

              {/* DEADLINES */}
              <Card className="border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-neutral-400" />

                    <h3 className="text-sm font-bold">
                      Upcoming
                    </h3>
                  </div>

                  <span className="text-[10px] font-medium text-neutral-400">
                    {deadlineCount}{" "}
                    {deadlineCount === 1 ? "deadline" : "deadlines"}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {deadlineItems.map((deadline) => (
                    <Link
                      key={deadline.id}
                      href={`/opportunities/${encodeURIComponent(
                        deadline.opportunity_id,
                      )}`}
                      className="flex items-start gap-3"
                    >
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${getDeadlineDot(
                          deadline.deadline,
                        )}`}
                      />

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                          {deadline.title}
                        </p>

                        <p className="mt-1 text-[10px] text-neutral-400">
                          {formatDaysLeft(deadline.deadline)}
                        </p>
                      </div>
                    </Link>
                  ))}

                  {deadlineItems.length === 0 && (
                    <p className="py-2 text-xs text-neutral-400">
                      No upcoming deadlines.
                    </p>
                  )}
                </div>

                <Link
                  href="/deadlines"
                  className="mt-5 inline-flex text-xs font-semibold text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
                >
                  View deadlines →
                </Link>
              </Card>

              {/* APPLICATIONS */}
              <Card className="border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                      Pipeline
                    </p>

                    <h3 className="mt-1 text-sm font-bold">
                      Applications
                    </h3>
                  </div>

                  <TrendingUp className="h-4 w-4 text-neutral-400" />
                </div>

                <div className="mt-5 grid grid-cols-4 gap-1">
                  <div className="text-center">
                    <p className="text-base font-bold">{savedCount}</p>
                    <p className="mt-1 text-[9px] text-neutral-400">
                      Saved
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-base font-bold">{appliedCount}</p>
                    <p className="mt-1 text-[9px] text-neutral-400">
                      Applied
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-base font-bold">{interviewCount}</p>
                    <p className="mt-1 text-[9px] text-neutral-400">
                      Interview
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-base font-bold">{offerCount}</p>
                    <p className="mt-1 text-[9px] text-neutral-400">
                      Offer
                    </p>
                  </div>
                </div>

                <Link
                  href="/applications"
                  className="mt-5 flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-white"
                >
                  Open tracker
                  <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              </Card>
            </aside>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
