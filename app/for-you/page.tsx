"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Flame,
  MapPin,
  Sparkles,
  Target,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

type Opportunity = {
  id: number;
  title: string;
  organization: string;
  type: string;
  location: string;
  experience: string;
  match: number;
  skills: string[];
  reason: string;
};

const opportunities: Opportunity[] = [
  {
    id: 1,
    title: "Frontend Engineer",
    organization: "Vercel",
    type: "Job",
    location: "Remote Worldwide",
    experience: "Junior",
    match: 96,
    skills: ["React", "JavaScript", "Next.js", "Git"],
    reason: "Strong match for your frontend skills and remote preference.",
  },
  {
    id: 2,
    title: "Junior Software Engineer",
    organization: "Andela",
    type: "Job",
    location: "Remote Africa",
    experience: "Junior",
    match: 93,
    skills: ["JavaScript", "React", "Git", "APIs"],
    reason: "Your experience level and technical interests align well.",
  },
  {
    id: 3,
    title: "Frontend Developer",
    organization: "Wellfound",
    type: "Job",
    location: "Remote Worldwide",
    experience: "Entry Level",
    match: 91,
    skills: ["HTML", "CSS", "JavaScript", "React"],
    reason: "Excellent fit for your current frontend development path.",
  },
  {
    id: 4,
    title: "Open Source Fellowship",
    organization: "Major League Hacking",
    type: "Fellowship",
    location: "Remote",
    experience: "Beginner",
    match: 88,
    skills: ["Git", "JavaScript", "Open Source"],
    reason: "Matches your learning stage and interest in practical projects.",
  },
  {
    id: 5,
    title: "Global Coding Scholarship",
    organization: "Tech Scholars",
    type: "Scholarship",
    location: "Worldwide",
    experience: "Beginner",
    match: 84,
    skills: ["Programming", "Web Development"],
    reason: "Good opportunity for developing your technical career.",
  },
];

export default function ForYouPage() {
  const [minimumMatch, setMinimumMatch] = useState(80);
  const [saved, setSaved] = useState<number[]>([]);

  const filtered = useMemo(
    () =>
      opportunities.filter(
        (opportunity) => opportunity.match >= minimumMatch
      ),
    [minimumMatch]
  );

  const toggleSaved = (id: number) => {
    setSaved((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
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
                {opportunities.filter((item) => item.match >= 90).length}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-2 text-neutral-400">
                <Flame className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                  Best match
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold">96%</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-2 text-neutral-400">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                  Opportunities
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold">{filtered.length}</p>
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
                <option value={70}>70%+</option>
                <option value={80}>80%+</option>
                <option value={90}>90%+</option>
                <option value={95}>95%+</option>
              </select>
            </label>
          </section>

          <section className="mt-4 space-y-3">
            {filtered.map((opportunity) => {
              const isSaved = saved.includes(opportunity.id);

              return (
                <article
                  key={opportunity.id}
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
                              {opportunity.type}
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
                              <Sparkles className="h-3 w-3" />
                              {opportunity.match}% match
                            </span>
                          </div>

                          <h3 className="mt-2 text-[16px] font-bold tracking-tight">
                            {opportunity.title}
                          </h3>

                          <p className="mt-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            {opportunity.organization}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleSaved(opportunity.id)}
                          className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                            isSaved
                              ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400"
                              : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          {isSaved ? "Saved" : "Save"}
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {opportunity.location}
                        </span>
                        <span className="text-neutral-300 dark:text-neutral-700">
                          ·
                        </span>
                        <span>{opportunity.experience}</span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {opportunity.skills.map((skill) => (
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
                          {opportunity.reason}
                        </p>

                        <button
                          type="button"
                          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-violet-600 dark:text-neutral-300 dark:hover:text-violet-400"
                        >
                          View opportunity
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {filtered.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center dark:border-neutral-700 dark:bg-neutral-900">
              <Target className="mx-auto h-7 w-7 text-neutral-300 dark:text-neutral-600" />
              <h3 className="mt-3 text-sm font-bold">
                No matches at this level
              </h3>
              <p className="mt-1 text-xs text-neutral-400">
                Lower the minimum match score to see more opportunities.
              </p>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
