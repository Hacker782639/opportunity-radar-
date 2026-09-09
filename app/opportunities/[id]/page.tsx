"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  Check,
  Clock3,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

const opportunity = {
  title: "Frontend Engineer",
  organization: "Vercel",
  type: "Job",
  location: "Remote · Worldwide",
  experience: "Junior",
  salary: "$90k–$130k",
  matchScore: 96,
  skills: ["React", "Next.js", "TypeScript", "JavaScript"],
  description:
    "Build polished web experiences and contribute to the tools and platforms used by developers around the world.",
  posted: "Posted 2 days ago",
  source: "Vercel Careers",
};

export default function OpportunityPage() {
  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 transition hover:text-neutral-950 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Discover
          </Link>

          <section className="mt-6 rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="p-5 sm:p-7">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                        {opportunity.type}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
                        <Sparkles className="h-3 w-3" />
                        {opportunity.matchScore}% match
                      </span>
                    </div>

                    <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                      {opportunity.title}
                    </h1>

                    <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      {opportunity.organization}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-300 dark:hover:text-white"
                  >
                    <Bookmark className="h-4 w-4" />
                    Save
                  </button>

                  <button
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-neutral-950 px-4 text-xs font-bold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                  >
                    Apply
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 border-t border-neutral-100 pt-5 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {opportunity.location}
                </span>

                <span>{opportunity.experience}</span>

                <span>{opportunity.salary}</span>

                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  {opportunity.posted}
                </span>
              </div>
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">

            <div className="space-y-6">

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <h2 className="text-sm font-bold">Why this matches you</h2>

                <div className="mt-4 space-y-3">
                  {[
                    "Your React and Next.js experience strongly matches the role.",
                    "The junior experience level aligns with your current profile.",
                    "Remote worldwide availability fits your preferred work mode.",
                  ].map((reason) => (
                    <div key={reason} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                        <Check className="h-3 w-3" />
                      </span>
                      <p className="text-xs leading-5 text-neutral-600 dark:text-neutral-300">
                        {reason}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <h2 className="text-sm font-bold">About the opportunity</h2>

                <p className="mt-4 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                  {opportunity.description}
                </p>

                <p className="mt-4 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                  You will work with engineers and designers to create reliable,
                  accessible and high-quality products. The role offers an
                  opportunity to learn quickly while contributing to production
                  software.
                </p>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <h2 className="text-sm font-bold">Skills</h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {opportunity.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

            </div>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Match quality
                </p>

                <div className="mt-3 flex items-end justify-between">
                  <span className="text-3xl font-bold tracking-tight">
                    {opportunity.matchScore}%
                  </span>

                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                    Excellent fit
                  </span>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div className="h-full w-[96%] rounded-full bg-violet-600" />
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Opportunity details
                </p>

                <div className="mt-4 space-y-4 text-xs">
                  <div>
                    <p className="text-neutral-400">Experience</p>
                    <p className="mt-1 font-semibold">{opportunity.experience}</p>
                  </div>

                  <div>
                    <p className="text-neutral-400">Location</p>
                    <p className="mt-1 font-semibold">{opportunity.location}</p>
                  </div>

                  <div>
                    <p className="text-neutral-400">Compensation</p>
                    <p className="mt-1 font-semibold">{opportunity.salary}</p>
                  </div>

                  <div>
                    <p className="text-neutral-400">Source</p>
                    <p className="mt-1 font-semibold">{opportunity.source}</p>
                  </div>
                </div>
              </section>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs font-bold text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:text-white"
              >
                Open original listing
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </aside>

          </div>
        </div>
      </main>
    </AppShell>
  );
}
