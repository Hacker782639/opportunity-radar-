"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCheck,
  Clock3,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/layout/app-shell";

type Application = {
  id: string;
  opportunity_id: string;
  title: string;
  company: string | null;
  status: "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";
  deadline: string | null;
  next_step: string | null;
  updated_at?: string;
  created_at: string;
};

type Notification = {
  id: string;
  type: "deadline" | "application" | "match";
  title: string;
  message: string;
  createdAt: string;
  href: string;
};

type ReadState = Record<string, boolean>;
type ClearedState = Record<string, boolean>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function daysUntil(value: string) {
  const now = new Date();
  const date = new Date(value);

  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function buildNotifications(applications: Application[]): Notification[] {
  const notifications: Notification[] = [];

  for (const application of applications) {
    if (application.deadline) {
      const days = daysUntil(application.deadline);

      if (days <= 7) {
        const message =
          days < 0
            ? `The deadline passed on ${formatDate(application.deadline)}.`
            : days === 0
              ? "This deadline is today."
              : days === 1
                ? "This deadline is tomorrow."
                : `${days} days remaining before the deadline.`;

        notifications.push({
          id: `deadline-${application.id}`,
          type: "deadline",
          title: `Deadline approaching: ${application.title}`,
          message,
          createdAt: application.deadline,
          href: `/opportunities/${encodeURIComponent(
            application.opportunity_id
          )}`,
        });
      }
    }

    if (
      application.status === "Interview" ||
      application.status === "Offer"
    ) {
      notifications.push({
        id: `application-${application.id}-${application.status}`,
        type: "application",
        title:
          application.status === "Interview"
            ? `Interview stage: ${application.title}`
            : `Offer stage: ${application.title}`,
        message:
          application.next_step ||
          `Your application is currently marked ${application.status}.`,
        createdAt: application.updated_at || application.created_at,
        href: "/applications",
      });
    }

    if (application.status === "Applied") {
      notifications.push({
        id: `applied-${application.id}`,
        type: "application",
        title: `Application tracked: ${application.title}`,
        message:
          application.next_step ||
          "Your application is now being tracked in your pipeline.",
        createdAt: application.updated_at || application.created_at,
        href: "/applications",
      });
    }
  }

  return notifications.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );
}

export default function NotificationsPage() {
  const supabase = createClient();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readState, setReadState] = useState<ReadState>({});
  const [clearedState, setClearedState] = useState<ClearedState>({});
  const [loading, setLoading] = useState(true);
  const [userKey, setUserKey] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNotifications() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const key = `opportunity-radar-notifications:${user.id}`;
      setUserKey(key);

      let nextClearedIds: ClearedState = {};

      try {
        const stored = localStorage.getItem(key);

        if (stored) {
          setReadState(JSON.parse(stored) as ReadState);
        }

        const storedCleared = localStorage.getItem(
          `${key}:cleared`,
        );

        if (storedCleared) {
          const parsedCleared = JSON.parse(storedCleared);

          if (
            parsedCleared &&
            typeof parsedCleared === "object" &&
            !Array.isArray(parsedCleared)
          ) {
            nextClearedIds = parsedCleared as ClearedState;
          }
        }
      } catch {
        setReadState({});
        nextClearedIds = {};
      }

      setClearedState(nextClearedIds);

      const { data, error: queryError } = await supabase
        .from("applications")
        .select(
          "id, opportunity_id, title, company, status, deadline, next_step, updated_at, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (queryError) {
        setError(queryError.message);
      } else {
        setNotifications(
          buildNotifications((data ?? []) as Application[]).filter(
            (notification) => !nextClearedIds[notification.id],
          ),
        );
      }

      setLoading(false);
    }

    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persistReadState(next: ReadState) {
    setReadState(next);

    if (userKey) {
      localStorage.setItem(userKey, JSON.stringify(next));
    }
  }

  function markRead(id: string) {
    persistReadState({
      ...readState,
      [id]: true,
    });
  }

  function markAllRead() {
    const next: ReadState = { ...readState };

    notifications.forEach((notification) => {
      next[notification.id] = true;
    });

    persistReadState(next);
  }

  function clearAll() {
    const nextClearedIds: ClearedState = { ...clearedState };

    notifications.forEach((notification) => {
      nextClearedIds[notification.id] = true;
    });

    setNotifications([]);
    setClearedState(nextClearedIds);

    if (userKey) {
      localStorage.setItem(
        `${userKey}:cleared`,
        JSON.stringify(nextClearedIds),
      );
    }
  }

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !readState[notification.id]
      ).length,
    [notifications, readState]
  );

  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1000px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
            Stay informed
          </p>

          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Notifications
            </h1>

            {unreadCount > 0 && (
              <span className="rounded-full bg-neutral-950 px-2 py-0.5 text-xs font-medium text-white dark:bg-white dark:text-neutral-950">
                {unreadCount} new
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Important updates from your opportunity radar and application
            pipeline.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>

            <button
              type="button"
              onClick={clearAll}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-medium text-neutral-500 hover:border-red-200 hover:text-red-600 dark:border-neutral-700"
            >
              <Trash2 size={14} />
              Clear
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
          Loading your notifications...
        </div>
      ) : !error && notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <Bell className="mx-auto h-8 w-8 text-neutral-400" />

          <h2 className="mt-4 text-base font-semibold">
            You&apos;re all caught up
          </h2>

          <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
            New application updates and approaching deadlines will appear
            here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const isRead = Boolean(readState[notification.id]);

            return (
              <div
                key={notification.id}
                className={`rounded-2xl border bg-white p-4 transition dark:bg-neutral-900 ${
                  isRead
                    ? "border-neutral-200 dark:border-neutral-800"
                    : "border-neutral-300 shadow-sm dark:border-neutral-700"
                }`}
                onClick={() => markRead(notification.id)}
              >
                <div className="flex gap-3">
                  <NotificationIcon type={notification.type} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          {!isRead && (
                            <span className="h-2 w-2 rounded-full bg-violet-600" />
                          )}

                          <h2 className="text-sm font-semibold">
                            {notification.title}
                          </h2>
                        </div>

                        <p className="mt-1 text-sm leading-5 text-neutral-500 dark:text-neutral-400">
                          {notification.message}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-neutral-400">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Link
                        href={notification.href}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 text-xs font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      >
                        View
                        <ExternalLink size={12} />
                      </Link>

                      {!isRead && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            markRead(notification.id);
                          }}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <Check size={13} />
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 shrink-0 text-neutral-500" size={16} />

          <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            Notifications are generated from your real application activity
            and deadlines. They update as your pipeline changes.
          </p>
        </div>
      </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

function NotificationIcon({
  type,
}: {
  type: Notification["type"];
}) {
  if (type === "deadline") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
        <CalendarDays size={17} />
      </div>
    );
  }

  if (type === "application") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
        <BriefcaseBusiness size={17} />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
      <Clock3 size={17} />
    </div>
  );
}
