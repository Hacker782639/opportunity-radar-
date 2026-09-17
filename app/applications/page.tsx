"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clock3,
  Search,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/layout/app-shell";

type Application = {
  id: string;
  opportunity_id: string;
  title: string;
  company: string | null;
  location: string | null;
  url: string | null;
  source: string | null;
  match_score: number | null;
  status: "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";
  next_step: string | null;
  deadline: string | null;
  applied_at: string | null;
  created_at: string;
};

const tabs = ["All", "Saved", "Applied", "Interview", "Offer", "Rejected"] as const;
type Tab = (typeof tabs)[number];

const statusStyles: Record<Application["status"], string> = {
  Saved: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  Applied: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  Interview:
    "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  Offer: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  Rejected:
    "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function ApplicationsPage() {
  const supabase = createClient();

  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadApplications() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setApplications([]);
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("applications")
      .select(
        "id, opportunity_id, title, company, location, url, source, match_score, status, next_step, deadline, applied_at, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setApplications([]);
    } else {
      setApplications((data ?? []) as Application[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadApplications();
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateApplication(
    id: string,
    updates: Partial<Application>
  ) {
    setUpdating(id);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please sign in again.");
      setUpdating(null);
      return;
    }

    const { data, error: updateError } = await supabase
      .from("applications")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(
        "id, opportunity_id, title, company, location, url, source, match_score, status, next_step, deadline, applied_at, created_at"
      )
      .single();

    if (updateError) {
      setError(updateError.message);
    } else if (data) {
      setApplications((current) =>
        current.map((application) =>
          application.id === id ? (data as Application) : application
        )
      );
    }

    setUpdating(null);
  }

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesTab =
        activeTab === "All" || application.status === activeTab;

      if (!matchesTab) return false;
      if (!query) return true;

      return [
        application.title,
        application.company,
        application.location,
        application.source,
        application.status,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
    });
  }, [applications, activeTab, search]);

  const stats = {
    total: applications.length,
    applied: applications.filter((item) => item.status === "Applied").length,
    interviews: applications.filter((item) => item.status === "Interview").length,
    offers: applications.filter((item) => item.status === "Offer").length,
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
          Your pipeline
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Applications
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Track every opportunity you&apos;ve saved, applied to, and progressed.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total" value={stats.total} />
        <Stat label="Applied" value={stats.applied} />
        <Stat label="Interviews" value={stats.interviews} />
        <Stat label="Offers" value={stats.offers} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search applications..."
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-neutral-600"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
          Loading your applications...
        </div>
      ) : !error && filteredApplications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <BriefcaseBusiness className="mx-auto h-8 w-8 text-neutral-400" />
          <h2 className="mt-4 text-base font-semibold">
            {applications.length === 0
              ? "No applications yet"
              : "No matching applications"}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
            {applications.length === 0
              ? "When you apply to an opportunity, it will appear here automatically."
              : "Try another search or switch to a different application status."}
          </p>

          {applications.length === 0 && (
            <Link
              href="/discover"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-neutral-950"
            >
              Discover opportunities
              <ArrowUpRight size={15} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((application) => (
            <article
              key={application.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[application.status]}`}
                    >
                      {application.status}
                    </span>

                    {application.match_score !== null && (
                      <span className="text-xs font-medium text-neutral-500">
                        {application.match_score}% match
                      </span>
                    )}

                    {application.source && (
                      <span className="text-xs text-neutral-400">
                        {application.source}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-2 truncate text-base font-semibold">
                    {application.title}
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {application.company || "Unknown company"}
                    {application.location
                      ? ` · ${application.location}`
                      : ""}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={13} />
                      Created {formatDate(application.created_at)}
                    </span>

                    {application.applied_at && (
                      <span className="inline-flex items-center gap-1.5">
                        <Check size={13} />
                        Applied {formatDate(application.applied_at)}
                      </span>
                    )}

                    {application.deadline && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        Deadline {formatDate(application.deadline)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <select
                    value={application.status}
                    disabled={updating === application.id}
                    onChange={(event) =>
                      updateApplication(application.id, {
                        status: event.target.value as Application["status"],
                        applied_at:
                          event.target.value === "Applied" &&
                          !application.applied_at
                            ? new Date().toISOString()
                            : application.applied_at,
                      })
                    }
                    className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-medium outline-none dark:border-neutral-700 dark:bg-neutral-950"
                  >
                    {tabs
                      .filter((tab) => tab !== "All")
                      .map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                  </select>

                  <Link
                    href={`/opportunities/${encodeURIComponent(
                      application.opportunity_id
                    )}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                  >
                    View
                    <ArrowUpRight size={13} />
                  </Link>

                  {application.url && (
                    <a
                      href={application.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-neutral-950 px-3 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                    >
                      Open
                      <ArrowUpRight size={13} />
                    </a>
                  )}

                  <button
                    type="button"
                    disabled={updating === application.id}
                    onClick={() =>
                      updateApplication(application.id, {
                        status: "Rejected",
                        next_step: "No further action",
                      })
                    }
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-200 px-2.5 text-neutral-400 hover:border-red-200 hover:text-red-600 dark:border-neutral-700"
                    aria-label="Mark as rejected"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {application.next_step && (
                <div className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    Next step:
                  </span>{" "}
                  {application.next_step}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
