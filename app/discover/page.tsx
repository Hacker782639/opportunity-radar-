"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  Check,
  Clock3,
  Filter,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/client";
import type { Job } from "@/lib/jobs/types";
import {
  getJobMatch,
  type MatchingProfile,
} from "@/lib/jobs/matching";


const categories = [
  "All",
  "Jobs",
  "Scholarships",
  "Grants",
  "Fellowships",
  "Hackathons",
];

const experiences = [
  "All",
  "Entry Level",
  "Junior",
  "Mid Level",
  "Senior",
];

function inferCategory(job: Job) {
  const text =
    `${job.title} ${job.company} ${job.location}`.toLowerCase();

  if (
    text.includes("scholarship") ||
    text.includes("student funding")
  ) {
    return "Scholarships";
  }

  if (text.includes("fellowship")) {
    return "Fellowships";
  }

  if (text.includes("grant")) {
    return "Grants";
  }

  if (
    text.includes("hackathon") ||
    text.includes("hack ") ||
    text.includes("coding challenge")
  ) {
    return "Hackathons";
  }

  return "Jobs";
}

function formatDate(value?: string) {
  if (!value) return "Recently posted";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently posted";
  }

  const days = Math.floor(
    (Date.now() - date.getTime()) / 86400000,
  );

  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function DiscoverContent() {
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<MatchingProfile>({});
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [category, setCategory] = useState("All");
  const [experience, setExperience] = useState("All");
  const searchParam = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(searchParam);
  const [lastSearchParam, setLastSearchParam] = useState(searchParam);

  if (searchParam !== lastSearchParam) {
    setLastSearchParam(searchParam);
    setSearch(searchParam);
  }
  const [sort, setSort] = useState("Match");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const [profileResult, savedResult] = await Promise.all([
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
      ]);

      setProfile(profileResult.data ?? {});
      setSavedIds(
        savedResult.data?.map((item) => item.opportunity_id) ?? [],
      );
    };

    loadUserData();
  }, [supabase]);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/jobs?search=${encodeURIComponent(search.trim())}`,
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to load opportunities.",
          );
        }

        setJobs(data.jobs ?? []);
      } catch (err) {
        console.error(err);
        setError("Unable to load opportunities right now.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadJobs, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const toggleSave = async (job: Job) => {
    if (savingId) return;

    setSavingId(job.id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSavingId(null);
      return;
    }

    const isSaved = savedIds.includes(job.id);

    if (isSaved) {
      const { error } = await supabase
        .from("saved_opportunities")
        .delete()
        .eq("user_id", user.id)
        .eq("opportunity_id", job.id);

      if (!error) {
        setSavedIds((current) =>
          current.filter((id) => id !== job.id),
        );
      }
    } else {
      const { error } = await supabase
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

      if (!error) {
        setSavedIds((current) => [...current, job.id]);
      } else {
        console.error("Save opportunity error:", error);
      }
    }

    setSavingId(null);
  };

  const matchByJobId = useMemo(
    () =>
      new Map(
        jobs.map((job) => [job.id, getJobMatch(job, profile)]),
      ),
    [jobs, profile],
  );

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (category !== "All") {
      result = result.filter(
        (job) => inferCategory(job) === category,
      );
    }

    if (experience !== "All") {
      result = result.filter((job) =>
        job.experience
          ?.toLowerCase()
          .includes(experience.toLowerCase()),
      );
    }

    if (remoteOnly) {
      result = result.filter((job) => job.remote);
    }

    if (sort === "Match") {
      result.sort(
        (a, b) =>
          (matchByJobId.get(b.id)?.score ?? 0) -
          (matchByJobId.get(a.id)?.score ?? 0),
      );
    } else {
      result.sort((a, b) => {
        const aTime = a.publishedAt
          ? new Date(a.publishedAt).getTime()
          : 0;

        const bTime = b.publishedAt
          ? new Date(b.publishedAt).getTime()
          : 0;

        return bTime - aTime;
      });
    }

    return result;
  }, [
    jobs,
    category,
    experience,
    remoteOnly,
    sort,
    matchByJobId,
  ]);

  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          <section className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>Radar</span>
              <span>/</span>
              <span className="text-neutral-700 dark:text-neutral-300">
                Discover
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Discover opportunities
                </h1>

                <p className="mt-1.5 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
                  Search live opportunities from across the web and find the ones worth your attention.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowFilters((current) => !current)
                }
                className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
            </div>
          </section>

          <section className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs, skills, companies..."
                className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-10 text-sm outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </section>

          <section className="mt-5 flex flex-wrap items-center gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  category === item
                    ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                    : "border border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
                }`}
              >
                {item}
              </button>
            ))}
          </section>

          {showFilters && (
            <section className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-wrap gap-5">

                <label className="flex items-center gap-2 text-xs font-semibold">
                  Experience
                  <select
                    value={experience}
                    onChange={(e) =>
                      setExperience(e.target.value)
                    }
                    className="h-9 rounded-lg border border-neutral-200 bg-white px-2 text-xs dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    {experiences.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold">
                  Sort
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="h-9 rounded-lg border border-neutral-200 bg-white px-2 text-xs dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <option>Match</option>
                    <option>Newest</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setRemoteOnly((current) => !current)
                  }
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
                    remoteOnly
                      ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                      : "border-neutral-200 text-neutral-500 dark:border-neutral-800"
                  }`}
                >
                  {remoteOnly && (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Remote only
                </button>

              </div>
            </section>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <BriefcaseBusiness className="h-4 w-4" />

              {loading
                ? "Scanning live sources..."
                : `${filteredJobs.length} opportunities`}
            </div>

            {!loading && jobs.length > 0 && (
              <span className="text-[11px] text-neutral-400">
                Live opportunity feed
              </span>
            )}
          </div>

          {loading && (
            <div className="mt-10 flex items-center justify-center py-16 text-sm text-neutral-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding opportunities...
            </div>
          )}

          {!loading && error && (
            <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-sm font-semibold">
                Something went wrong
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                {error}
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            filteredJobs.length === 0 && (
              <div className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
                <Filter className="mx-auto h-5 w-5 text-neutral-400" />

                <h2 className="mt-3 text-sm font-bold">
                  No opportunities found
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  Try another search or clear your filters.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                    setExperience("All");
                    setRemoteOnly(false);
                    setSort("Match");
                  }}
                  className="mt-4 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-neutral-950"
                >
                  Clear filters
                </button>
              </div>
            )}

          {!loading &&
            !error &&
            filteredJobs.length > 0 && (
              <section className="mt-4 space-y-3">
                {filteredJobs.map((job) => {
                  const saved = savedIds.includes(job.id);
                  const match = matchByJobId.get(job.id)?.score ?? 0;

                  return (
                    <article
                      key={job.id}
                      className="rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 sm:p-5"
                    >
                      <div className="flex gap-4">

                        <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300 sm:flex">
                          <BriefcaseBusiness className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                              {job.source}
                            </span>

                            {job.remote && (
                              <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300">
                                Remote
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400">
                              <Clock3 className="h-3 w-3" />
                              {formatDate(job.publishedAt)}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                            <div className="min-w-0">
                              <h2 className="truncate text-sm font-bold sm:text-base">
                                {job.title}
                              </h2>

                              <p className="mt-1 text-xs font-medium text-neutral-500">
                                {job.company}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <span className="rounded-md bg-neutral-950 px-2 py-1 text-[10px] font-bold text-white dark:bg-white dark:text-neutral-950">
                                {match}% match
                              </span>

                              <button
                                type="button"
                                disabled={savingId === job.id}
                                onClick={() => toggleSave(job)}
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                                  saved
                                    ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                                    : "border-neutral-200 text-neutral-400 hover:text-neutral-950 dark:border-neutral-800 dark:hover:text-white"
                                }`}
                                aria-label={
                                  saved
                                    ? "Remove saved opportunity"
                                    : "Save opportunity"
                                }
                              >
                                {savingId === job.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Bookmark
                                    className="h-3.5 w-3.5"
                                    fill={
                                      saved
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                )}
                              </button>
                            </div>

                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-neutral-400">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location || "Location not listed"}
                            </span>

                            <span>
                              {job.experience || "Experience not listed"}
                            </span>

                            {job.salary && (
                              <span>{job.salary}</span>
                            )}
                          </div>

                          {job.skills?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {job.skills
                                .slice(0, 4)
                                .map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300"
                                  >
                                    {skill}
                                  </span>
                                ))}
                            </div>
                          )}

                   <div className="mt-4 flex items-center justify-end">
                            <Link
                              href={`/opportunities/${encodeURIComponent(job.id)}`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
                            >
                              View opportunity
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>

                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}

        </div>
      </main>
    </AppShell>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<DiscoverFallback />}>
      <DiscoverContent />
    </Suspense>
  );
}

function DiscoverFallback() {
  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section
            role="status"
            aria-live="polite"
            className="border-b border-neutral-200 pb-6 dark:border-neutral-800"
          >
            <span className="sr-only">Loading discover results...</span>
            <div className="h-3 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="mt-5 h-8 w-72 max-w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </section>

          <div className="mt-6 h-11 w-full animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </main>
    </AppShell>
  );
}
