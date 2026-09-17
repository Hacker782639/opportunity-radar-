"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/layout/app-shell";

type Application = {
  id: string;
  opportunity_id: string;
  title: string;
  company: string | null;
  location: string | null;
  status: "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";
  deadline: string | null;
  next_step: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function daysUntil(value: string) {
  const now = new Date();
  const deadline = new Date(value);

  now.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  return Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function deadlineLabel(days: number) {
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days} days left`;
}

export default function DeadlinesPage() {
  const supabase = createClient();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDeadlines() {
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
          "id, opportunity_id, title, company, location, status, deadline, next_step"
        )
        .eq("user_id", user.id)
        .not("deadline", "is", null)
        .neq("status", "Rejected")
        .order("deadline", { ascending: true });

      if (queryError) {
        setError(queryError.message);
        setApplications([]);
      } else {
        setApplications((data ?? []) as Application[]);
      }

      setLoading(false);
    }

    loadDeadlines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(
    () =>
      [...applications].sort(
        (a, b) =>
          new Date(a.deadline!).getTime() -
          new Date(b.deadline!).getTime()
      ),
    [applications]
  );

  const overdue = sorted.filter((item) => daysUntil(item.deadline!) < 0);
  const urgent = sorted.filter((item) => {
    const days = daysUntil(item.deadline!);
    return days >= 0 && days <= 3;
  });
  const upcoming = sorted.filter((item) => daysUntil(item.deadline!) > 3);

  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
          Stay ahead
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Deadlines
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Keep track of important application deadlines and next steps.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs font-medium text-neutral-500">Total</p>
          <p className="mt-1 text-2xl font-semibold">{sorted.length}</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs font-medium text-neutral-500">Urgent</p>
          <p className="mt-1 text-2xl font-semibold">{urgent.length}</p>
        </div>

        <div className="col-span-2 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-1">
          <p className="text-xs font-medium text-neutral-500">Overdue</p>
          <p className="mt-1 text-2xl font-semibold">{overdue.length}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
          Loading your deadlines...
        </div>
      ) : !error && sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <CalendarDays className="mx-auto h-8 w-8 text-neutral-400" />

          <h2 className="mt-4 text-base font-semibold">
            No deadlines yet
          </h2>

          <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
            Deadlines will appear here automatically when an application has
            a deadline.
          </p>

          <Link
            href="/applications"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-neutral-950"
          >
            View applications
            <ArrowUpRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="space-y-7">
          {overdue.length > 0 && (
            <DeadlineGroup
              title="Overdue"
              icon={<AlertTriangle size={16} />}
              items={overdue}
              urgent
            />
          )}

          {urgent.length > 0 && (
            <DeadlineGroup
              title="Act first"
              icon={<Clock3 size={16} />}
              items={urgent}
              urgent
            />
          )}

          {upcoming.length > 0 && (
            <DeadlineGroup
              title="Upcoming"
              icon={<CalendarDays size={16} />}
              items={upcoming}
            />
          )}
        </div>
      )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}

function DeadlineGroup({
  title,
  icon,
  items,
  urgent = false,
}: {
  title: string;
  icon: React.ReactNode;
  items: Application[];
  urgent?: boolean;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className={urgent ? "text-red-500" : "text-neutral-500"}>
          {icon}
        </span>

        <h2 className="text-sm font-semibold">{title}</h2>

        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800">
          {items.length}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const days = daysUntil(item.deadline!);

          return (
            <article
              key={item.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        days < 0
                          ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                          : days <= 3
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                      }`}
                    >
                      {deadlineLabel(days)}
                    </span>

                    <span className="text-xs text-neutral-400">
                      {item.status}
                    </span>
                  </div>

                  <h3 className="mt-2 truncate text-base font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {item.company || "Unknown company"}
                    {item.location ? ` · ${item.location}` : ""}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={13} />
                      {formatDate(item.deadline!)}
                    </span>

                    {item.next_step && (
                      <span>
                        Next: {item.next_step}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/opportunities/${encodeURIComponent(
                    item.opportunity_id
                  )}`}
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  View
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
