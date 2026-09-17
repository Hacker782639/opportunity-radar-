import { BriefcaseBusiness } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

export default function Loading() {
  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section
            role="status"
            aria-live="polite"
            className="mt-6 rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex gap-4 p-5 sm:p-7">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <span className="sr-only">Loading opportunity...</span>
                <div className="h-3 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="mt-4 h-7 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
