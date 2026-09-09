"use client";

import { useState } from "react";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Plus,
  Search,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected";

type Application = {
  title: string;
  organization: string;
  type: string;
  status: ApplicationStatus;
  date: string;
  match: number;
  nextStep?: string;
};

const applications: Application[] = [
  {
    title: "Frontend Engineer",
    organization: "Vercel",
    type: "Job",
    status: "Interview",
    date: "Aug 29",
    match: 96,
    nextStep: "Technical interview",
  },
  {
    title: "Junior Software Engineer",
    organization: "Andela",
    type: "Job",
    status: "Applied",
    date: "Aug 31",
    match: 93,
    nextStep: "Awaiting response",
  },
  {
    title: "Software Engineering Fellowship",
    organization: "Major League Hacking",
    type: "Fellowship",
    status: "Saved",
    date: "Sep 1",
    match: 88,
  },
  {
    title: "Frontend Developer",
    organization: "Wellfound",
    type: "Job",
    status: "Applied",
    date: "Aug 27",
    match: 91,
    nextStep: "Awaiting response",
  },
  {
    title: "Open Source Hackathon",
    organization: "GitHub",
    type: "Hackathon",
    status: "Rejected",
    date: "Aug 22",
    match: 86,
  },
];

const statuses: Array<"All" | ApplicationStatus> = [
  "All",
  "Saved",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
];

const statusStyles: Record<ApplicationStatus, string> = {
  Saved:
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  Applied:
    "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  Interview:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Offer:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  Rejected:
    "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] =
    useState<"All" | ApplicationStatus>("All");

  const filtered =
    statusFilter === "All"
      ? applications
      : applications.filter((item) => item.status === statusFilter);

  const counts = {
    saved: applications.filter((item) => item.status === "Saved").length,
    applied: applications.filter((item) => item.status === "Applied").length,
    interview: applications.filter((item) => item.status === "Interview").length,
    offer: applications.filter((item) => item.status === "Offer").length,
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          <section className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>Workspace</span>
              <span>/</span>
              <span className="text-neutral-700 dark:text-neutral-300">
                Applications
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Application tracker
                </h1>
                <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  Keep every opportunity and application moving forward.
                </p>
              </div>

              <button
                type="button"
                className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-neutral-950 px-4 text-xs font-bold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                <Plus className="h-4 w-4" />
                Add application
              </button>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Saved", counts.saved],
              ["Applied", counts.applied],
              ["Interview", counts.interview],
              ["Offers", counts.offer],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-bold">{value}</p>
              </div>
            ))}
          </section>

          <section className="mt-8">
            <div className="flex flex-col gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-1 overflow-x-auto">
                {statuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      statusFilter === status
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                        : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 self-start rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Export
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">

              <div className="hidden grid-cols-[minmax(0,1fr)_110px_100px_120px_32px] items-center gap-4 border-b border-neutral-200 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400 dark:border-neutral-800 md:grid">
                <span>Opportunity</span>
                <span>Status</span>
                <span>Match</span>
                <span>Next step</span>
                <span />
              </div>

              {filtered.map((application) => (
                <div
                  key={`${application.organization}-${application.title}`}
                  className="grid gap-4 border-b border-neutral-100 px-4 py-4 last:border-0 dark:border-neutral-800 sm:px-5 md:grid-cols-[minmax(0,1fr)_110px_100px_120px_32px] md:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 sm:flex dark:bg-neutral-800 dark:text-neutral-300">
                        <BriefcaseBusiness className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {application.title}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                          {application.organization}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-[10px] text-neutral-400">
                          <span>{application.type}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {application.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold ${statusStyles[application.status]}`}
                    >
                      {application.status}
                    </span>
                  </div>

                  <div>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {application.match}%
                    </span>
                  </div>

                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {application.nextStep || "—"}
                  </div>

                  <button
                    type="button"
                    aria-label={`Open ${application.title}`}
                    className="hidden rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 md:block dark:hover:bg-neutral-800 dark:hover:text-white"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>

                  <div className="flex items-center justify-between md:hidden">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold ${statusStyles[application.status]}`}
                    >
                      {application.status}
                    </span>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-bold text-violet-600 dark:text-violet-400">
                        {application.match}% match
                      </span>
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <CheckCircle2 className="mx-auto h-7 w-7 text-neutral-300 dark:text-neutral-600" />
                  <h3 className="mt-3 text-sm font-bold">
                    Nothing here yet
                  </h3>
                  <p className="mt-1 text-xs text-neutral-400">
                    Applications with this status will appear here.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="mt-5 flex items-center gap-2 text-[11px] text-neutral-400">
            <Clock3 className="h-3.5 w-3.5" />
            Keep your application status updated so your radar stays useful.
          </section>

        </div>
      </main>
    </AppShell>
  );
}
