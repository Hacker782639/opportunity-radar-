"use client";

import Link from "next/link";
import { useEffect } from "react";

import { AppShell } from "@/components/layout/app-shell";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(
      "Opportunity detail failed to load.",
      error.digest ? `Digest: ${error.digest}` : undefined,
    );
  }, [error]);

  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-7">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Unable to load opportunity
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              This opportunity could not be loaded right now. Please try again.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={retry}
                className="inline-flex h-10 items-center rounded-lg bg-neutral-950 px-4 text-xs font-bold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                Try again
              </button>

              <Link
                href="/discover"
                className="inline-flex h-10 items-center rounded-lg border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-300 dark:hover:text-white"
              >
                Back to Discover
              </Link>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
