"use client";

import { useState } from "react";

import {
  AlertCircle,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCheck,
  Clock3,
  Sparkles,
  Trash2,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

type Notification = {
  id: number;
  title: string;
  description: string;
  time: string;
  type: "match" | "deadline" | "application" | "system";
  unread: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "New 96% match found",
    description:
      "Frontend Engineer at Vercel matches your profile strongly.",
    time: "12 min ago",
    type: "match",
    unread: true,
  },
  {
    id: 2,
    title: "Deadline approaching",
    description:
      "Developer Fellowship closes in 2 days.",
    time: "1 hour ago",
    type: "deadline",
    unread: true,
  },
  {
    id: 3,
    title: "Application reminder",
    description:
      "Your Andela application is still awaiting a response.",
    time: "3 hours ago",
    type: "application",
    unread: true,
  },
  {
    id: 4,
    title: "New opportunities available",
    description:
      "12 new opportunities were added to your radar.",
    time: "Yesterday",
    type: "match",
    unread: false,
  },
  {
    id: 5,
    title: "Profile strength improved",
    description:
      "Your profile is now 72% complete.",
    time: "Yesterday",
    type: "system",
    unread: false,
  },
];

const iconMap = {
  match: Sparkles,
  deadline: CalendarDays,
  application: BriefcaseBusiness,
  system: CheckCheck,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const markAllRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1000px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          <section className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>Account</span>
              <span>/</span>
              <span className="text-neutral-700 dark:text-neutral-300">
                Notifications
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Notifications
                </h1>
                <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  Important updates from your opportunity radar.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-600 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}

                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-900"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                Total
              </p>
              <p className="mt-2 text-2xl font-bold">
                {notifications.length}
              </p>
            </div>

            <div className="rounded-xl border border-violet-100 bg-white p-4 dark:border-violet-500/20 dark:bg-neutral-900">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-600 dark:text-violet-400">
                Unread
              </p>
              <p className="mt-2 text-2xl font-bold text-violet-600 dark:text-violet-400">
                {unreadCount}
              </p>
            </div>

            <div className="hidden rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                Priority
              </p>
              <p className="mt-2 text-2xl font-bold">2</p>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-neutral-400" />
              <h2 className="text-sm font-bold">Recent activity</h2>
            </div>

            {notifications.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                {notifications.map((notification) => {
                  const Icon = iconMap[notification.type];

                  return (
                    <div
                      key={notification.id}
                      className={`flex gap-4 border-b border-neutral-100 p-4 last:border-0 dark:border-neutral-800 sm:p-5 ${
                        notification.unread
                          ? "bg-violet-50/30 dark:bg-violet-500/[0.03]"
                          : ""
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300">
                          <Icon className="h-4 w-4" />
                        </div>

                        {notification.unread && (
                          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-violet-600" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <p className="text-sm font-bold">
                            {notification.title}
                          </p>

                          <span className="shrink-0 text-[10px] text-neutral-400">
                            {notification.time}
                          </span>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                          {notification.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center dark:border-neutral-700 dark:bg-neutral-900">
                <CheckCheck className="mx-auto h-7 w-7 text-neutral-300 dark:text-neutral-600" />
                <h3 className="mt-3 text-sm font-bold">
                  You're all caught up
                </h3>
                <p className="mt-1 text-xs text-neutral-400">
                  New radar activity will appear here.
                </p>
              </div>
            )}
          </section>

          <section className="mt-5 flex items-center gap-2 text-[11px] text-neutral-400">
            <Clock3 className="h-3.5 w-3.5" />
            Notifications help you catch strong matches and approaching deadlines.
          </section>

        </div>
      </main>
    </AppShell>
  );
}
