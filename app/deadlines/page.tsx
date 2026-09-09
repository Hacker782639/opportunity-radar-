"use client";

import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

type Deadline = {
  title: string;
  organization: string;
  type: string;
  deadline: string;
  daysLeft: number;
  priority: "Urgent" | "Soon" | "Upcoming";
  match: number;
};

const deadlines: Deadline[] = [
  {
    title: "Developer Fellowship",
    organization: "Tech Foundation",
    type: "Fellowship",
    deadline: "September 7, 2026",
    daysLeft: 2,
    priority: "Urgent",
    match: 94,
  },
  {
    title: "Open Source Program",
    organization: "Major League Hacking",
    type: "Fellowship",
    deadline: "September 11, 2026",
    daysLeft: 6,
    priority: "Soon",
    match: 91,
  },
  {
    title: "Technology Grant",
    organization: "Future Labs",
    type: "Grant",
    deadline: "September 16, 2026",
    daysLeft: 11,
    priority: "Upcoming",
    match: 87,
  },
  {
    title: "Global Coding Scholarship",
    organization: "Tech Scholars",
    type: "Scholarship",
    deadline: "September 23, 2026",
    daysLeft: 18,
    priority: "Upcoming",
    match: 84,
  },
];

const priorityStyles = {
  Urgent:
    "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  Soon:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Upcoming:
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
};

export default function DeadlinesPage() {
  const urgent = deadlines.filter((item) => item.daysLeft <= 3).length;
  const soon = deadlines.filter(
    (item) => item.daysLeft > 3 && item.daysLeft <= 7
  ).length;

  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          <section className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>Workspace</span>
              <span>/</span>
              <span className="text-neutral-700 dark:text-neutral-300">
                Deadlines
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Deadlines
                </h1>
                <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  Stay ahead of the opportunities that have closing dates.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <CalendarDays className="h-4 w-4" />
                <span>{deadlines.length} active deadlines</span>
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                Active
              </p>
              <p className="mt-2 text-2xl font-bold">{deadlines.length}</p>
            </div>

            <div className="rounded-xl border border-red-100 bg-white p-4 dark:border-red-500/20 dark:bg-neutral-900">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-500">
                Urgent
              </p>
              <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                {urgent}
              </p>
            </div>

            <div className="hidden rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                Next 7 days
              </p>
              <p className="mt-2 text-2xl font-bold">{urgent + soon}</p>
            </div>
          </section>

          <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold">
                    Upcoming deadlines
                  </h2>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    Prioritized by how soon each opportunity closes.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                {deadlines.map((item) => (
                  <div
                    key={item.title}
                    className="border-b border-neutral-100 p-4 last:border-0 dark:border-neutral-800 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          item.priority === "Urgent"
                            ? "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400"
                            : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300"
                        }`}
                      >
                        {item.priority === "Urgent" ? (
                          <AlertCircle className="h-[18px] w-[18px]" />
                        ) : (
                          <CalendarDays className="h-[18px] w-[18px]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold">
                            {item.title}
                          </h3>

                          <span
                            className={`rounded-md px-2 py-1 text-[10px] font-bold ${priorityStyles[item.priority]}`}
                          >
                            {item.priority}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                          {item.organization} · {item.type}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-neutral-400">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {item.deadline}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5" />
                            {item.daysLeft} days left
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                        <div>
                          <p className="text-[10px] text-neutral-400">
                            Match
                          </p>
                          <p className="mt-1 text-sm font-bold text-violet-600 dark:text-violet-400">
                            {item.match}%
                          </p>
                        </div>

                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-950 sm:mt-3 dark:hover:text-white"
                        >
                          Open
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                </div>

                <h3 className="mt-4 text-sm font-bold">
                  Act first
                </h3>

                <p className="mt-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                  You have {urgent} deadline that needs attention within
                  the next three days.
                </p>

                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400"
                >
                  Review now
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-bold">
                    Stay organized
                  </h3>
                </div>

                <p className="mt-3 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                  Save opportunities you're interested in and track their
                  deadlines automatically.
                </p>

                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
                >
                  Go to Saved
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </aside>

          </section>
        </div>
      </main>
    </AppShell>
  );
}
