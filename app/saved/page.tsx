"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  Trash2,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/client";

type SavedOpportunity = {
  id: number;
  opportunity_id: string;
  title: string;
  company: string | null;
  location: string | null;
  remote: boolean;
  experience: string | null;
  salary: string | null;
  url: string | null;
  source: string | null;
  published_at: string | null;
  created_at: string;
};

export default function SavedPage() {
  const supabase = createClient();

  const [items, setItems] = useState<SavedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    const loadSaved = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("saved_opportunities")
        .select(
          "id, opportunity_id, title, company, location, remote, experience, salary, url, source, published_at, created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Saved opportunities error:", error);
      } else {
        setItems(data ?? []);
      }

      setLoading(false);
    };

    loadSaved();
  }, []);

  const removeSaved = async (item: SavedOpportunity) => {
    if (removing) return;

    setRemoving(item.id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRemoving(null);
      return;
    }

    const { error } = await supabase
      .from("saved_opportunities")
      .delete()
      .eq("id", item.id)
      .eq("user_id", user.id);

    if (!error) {
      setItems((current) =>
        current.filter((saved) => saved.id !== item.id),
      );
    }

    setRemoving(null);
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          <section className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>Radar</span>
              <span>/</span>
              <span className="text-neutral-700 dark:text-neutral-300">
                Saved
              </span>
            </div>

            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Saved opportunities
                </h1>

                <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  Keep the opportunities you want to come back to.
                </p>
              </div>

              <div className="hidden items-center gap-2 text-xs text-neutral-400 sm:flex">
                <Bookmark className="h-4 w-4" />
                {items.length} saved
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-[11px] font-semibold text-neutral-400">
                Saved
              </p>
              <p className="mt-1 text-xl font-bold">
                {items.length}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-[11px] font-semibold text-neutral-400">
                Remote
              </p>
              <p className="mt-1 text-xl font-bold">
                {items.filter((item) => item.remote).length}
              </p>
            </div>

            <div className="hidden rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:block">
              <p className="text-[11px] font-semibold text-neutral-400">
                Sources
              </p>
              <p className="mt-1 text-xl font-bold">
                {new Set(
                  items
                    .map((item) => item.source)
                    .filter(Boolean),
                ).size}
              </p>
            </div>
          </section>

          {loading && (
            <div className="flex items-center justify-center py-20 text-sm text-neutral-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading saved opportunities...
            </div>
          )}

          {!loading && items.length === 0 && (
            <section className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <Bookmark className="mx-auto h-6 w-6 text-neutral-400" />

              <h2 className="mt-3 text-sm font-bold">
                Nothing saved yet
              </h2>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                When you find an opportunity worth pursuing, save it here so you can return to it later.
              </p>

              <a
                href="/discover"
                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-neutral-950 px-4 text-xs font-bold text-white dark:bg-white dark:text-neutral-950"
              >
                Discover opportunities
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </section>
          )}

          {!loading && items.length > 0 && (
            <section className="mt-6 space-y-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5"
                >
                  <div className="flex gap-4">
                    <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300 sm:flex">
                      <BriefcaseBusiness className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                          {item.source || "Opportunity"}
                        </span>

                        {item.remote && (
                          <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300">
                            Remote
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400">
                          <Clock3 className="h-3 w-3" />
                          Saved{" "}
                          {new Date(
                            item.created_at,
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h2 className="text-sm font-bold sm:text-base">
                            {item.title}
                          </h2>

                          <p className="mt-1 text-xs font-medium text-neutral-500">
                            {item.company || "Company"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSaved(item)}
                          disabled={removing === item.id}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-lg border border-neutral-200 text-neutral-400 transition hover:border-neutral-300 hover:text-neutral-950 disabled:opacity-50 dark:border-neutral-800 dark:hover:text-white"
                          aria-label="Remove saved opportunity"
                        >
                          {removing === item.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-neutral-400">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location || "Worldwide"}
                        </span>

                        <span>
                          {item.experience || "All levels"}
                        </span>

                        {item.salary && (
                          <span>{item.salary}</span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-end">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
                          >
                            View opportunity
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}

          <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
            <CalendarDays className="h-3.5 w-3.5" />
            Your saved opportunities are synced to your account.
          </div>

        </div>
      </main>
    </AppShell>
  );
}
