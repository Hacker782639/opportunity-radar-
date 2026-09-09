"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Pencil,
  Sparkles,
} from "lucide-react";

const sections = [
  {
    title: "Personal information",
    items: [
      ["Name", "Junior"],
      ["Location", "Nigeria"],
      ["Role", "Frontend Developer"],
    ],
  },
  {
    title: "Experience",
    items: [
      ["Experience level", "Beginner"],
      ["Years of experience", "0–1 years"],
    ],
  },
  {
    title: "Skills",
    items: [
      ["Primary skills", "JavaScript, HTML, CSS, React"],
      ["Additional skills", "Git, Next.js"],
    ],
  },
  {
    title: "Education",
    items: [
      ["Education", "Not detected yet"],
    ],
  },
];

export default function CVReviewPage() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
      <div className="mx-auto w-full max-w-[900px] px-4 py-6 sm:px-6 lg:py-10">

        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
              <Sparkles className="h-4 w-4" />
            </div>

            <span className="text-sm font-bold tracking-tight">
              Opportunity Radar
            </span>
          </div>

          <span className="text-xs text-neutral-400">
            CV review
          </span>
        </header>

        <div className="mt-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">
            Review
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Check what Radar found
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">
            Review the information extracted from your CV before adding it
            to your profile.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
            <FileText className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Your uploaded CV</p>
            <p className="mt-0.5 text-xs text-neutral-400">
              Information below is ready for review
            </p>
          </div>

          <span className="hidden items-center gap-1.5 text-xs font-semibold text-emerald-600 sm:flex">
            <Check className="h-3.5 w-3.5" />
            Processed
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                <h2 className="text-sm font-bold">{section.title}</h2>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {section.items.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr]"
                  >
                    <span className="text-xs text-neutral-400">
                      {label}
                    </span>

                    <span className="text-sm font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50/60 p-5 dark:border-violet-500/20 dark:bg-violet-500/5">
          <div className="flex gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />

            <div>
              <h2 className="text-sm font-bold">
                Your approval matters
              </h2>

              <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                Radar won't use these extracted details until you confirm
                them.
              </p>
            </div>
          </div>
        </div>

        {confirmed && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Check className="h-4 w-4" />
            Profile information confirmed.
          </div>
        )}

        <footer className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-5 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <button
            type="button"
            onClick={() => setConfirmed(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-violet-600 px-4 text-xs font-semibold text-white transition hover:bg-violet-700"
          >
            Confirm profile
            {confirmed ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
          </button>
        </footer>
      </div>
    </main>
  );
}
