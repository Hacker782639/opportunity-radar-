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
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { Card } from "@/components/ui/card";

const opportunities = [
  {
    title: "Frontend Engineer",
    organization: "Vercel",
    type: "Job" as const,
    location: "Remote · Worldwide",
    experience: "Beginner",
    salary: "$90k–$130k",
    matchScore: 96,
    skills: ["React", "Next.js", "TypeScript", "Remote"],
  },
  {
    title: "{userExperience} Software Engineer",
    organization: "Andela",
    type: "Job" as const,
    location: "Remote · Africa",
    experience: "Beginner",
    salary: "$60k–$90k",
    matchScore: 93,
    skills: ["JavaScript", "Node.js", "Git"],
  },
  {
    title: "{primaryRole}",
    organization: "Wellfound",
    type: "Job" as const,
    location: "Remote · Worldwide",
    experience: "Entry Level",
    salary: "$55k–$85k",
    matchScore: 91,
    skills: ["React", "CSS", "JavaScript"],
  },
];

const stats = [
  {
    label: "New matches",
    value: "47",
    detail: "+12 this week",
    icon: Sparkles,
  },
  {
    label: "Saved",
    value: "12",
    detail: "3 added today",
    icon: Bookmark,
  },
  {
    label: "Applications",
    value: "7",
    detail: "2 need attention",
    icon: BriefcaseBusiness,
  },
  {
    label: "Deadlines",
    value: "3",
    detail: "Next 7 days",
    icon: CalendarDays,
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select(
          "full_name, location, experience, skills, preferred_roles, opportunity_types, work_preference, onboarding_completed",
        )
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "there";

  const primaryRole =
    profile?.preferred_roles?.[0] || "{primaryRole}";

  const userLocation = profile?.location || "{userLocation}";

  const userExperience =
    profile?.experience || "Beginner";

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

            <button
              type="button"
              className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              <Search className="h-4 w-4" />
              Discover
            </button>
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
                      Scanning opportunities against your current profile.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-neutral-200 dark:divide-neutral-800">
                  <div className="px-4 first:pl-0">
                    <p className="text-lg font-bold">1,284</p>
                    <p className="mt-0.5 whitespace-nowrap text-[10px] text-neutral-400">
                      scanned
                    </p>
                  </div>

                  <div className="px-4">
                    <p className="text-lg font-bold">47</p>
                    <p className="mt-0.5 whitespace-nowrap text-[10px] text-neutral-400">
                      matches
                    </p>
                  </div>

                  <div className="px-4 last:pr-0">
                    <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
                      86%
                    </p>
                    <p className="mt-0.5 whitespace-nowrap text-[10px] text-neutral-400">
                      match quality
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-violet-600 dark:hover:text-violet-400"
                >
                  Tune radar
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
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
                    <Flame className="h-4 w-4 text-violet-600 dark:text-violet-400" />

                    <h2 className="text-base font-bold">
                      Strongest matches
                    </h2>
                  </div>

                  <p className="mt-1 text-xs text-neutral-400">
                    Ranked by fit, relevance and freshness.
                  </p>
                </div>

                <button
                  type="button"
                  className="hidden items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-950 sm:flex dark:hover:text-white"
                >
                  View all
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {opportunities.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.title}
                    {...opportunity}
                  />
                ))}
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

                  <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                    72%
                  </span>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div className="h-full w-[72%] rounded-full bg-violet-600" />
                </div>

                <p className="mt-4 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                  Add projects, experience and skills to improve your matches.
                </p>

                <button
                  type="button"
                  className="mt-4 text-xs font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400"
                >
                  Improve profile →
                </button>
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
                    3 deadlines
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />

                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">
                        Developer Fellowship
                      </p>

                      <p className="mt-1 text-[10px] text-red-500">
                        2 days left
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />

                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">
                        Open Source Program
                      </p>

                      <p className="mt-1 text-[10px] text-neutral-400">
                        6 days left
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-600" />

                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">
                        Technology Grant
                      </p>

                      <p className="mt-1 text-[10px] text-neutral-400">
                        11 days left
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-5 text-xs font-semibold text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
                >
                  View deadlines →
                </button>
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
                    <p className="text-base font-bold">12</p>
                    <p className="mt-1 text-[9px] text-neutral-400">
                      Saved
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-base font-bold">7</p>
                    <p className="mt-1 text-[9px] text-neutral-400">
                      Applied
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-base font-bold">2</p>
                    <p className="mt-1 text-[9px] text-neutral-400">
                      Interview
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-base font-bold">0</p>
                    <p className="mt-1 text-[9px] text-neutral-400">
                      Offer
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-5 flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-white"
                >
                  Open tracker
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </Card>
            </aside>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
