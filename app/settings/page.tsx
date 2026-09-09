"use client";

import { useState } from "react";
import {
  Bell,
  ChevronRight,
  Eye,
  Lock,
  Moon,
  ShieldCheck,
  SlidersHorizontal,
  User,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { useTheme } from "@/components/layout/theme-provider";

type ToggleProps = {
  enabled: boolean;
  onChange: () => void;
};

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-label={enabled ? "Disable setting" : "Enable setting"}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
        enabled
          ? "bg-violet-600"
          : "bg-neutral-200 dark:bg-neutral-700"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "left-5" : "left-1"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [applicationAlerts, setApplicationAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
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
                Settings
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Settings
                </h1>
                <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  Control how Opportunity Radar works for you.
                </p>
              </div>

              <button
                type="button"
                onClick={saveSettings}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-neutral-950 px-4 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                {saved ? "Saved" : "Save changes"}
              </button>
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">

            <div className="space-y-6">

              <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <Bell className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">Notifications</h2>
                    <p className="text-[11px] text-neutral-400">
                      Choose which updates you receive.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold">Email notifications</p>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        Receive important Radar updates by email.
                      </p>
                    </div>
                    <Toggle
                      enabled={emailAlerts}
                      onChange={() => setEmailAlerts(!emailAlerts)}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold">High-match alerts</p>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        Get notified when strong opportunities appear.
                      </p>
                    </div>
                    <Toggle
                      enabled={matchAlerts}
                      onChange={() => setMatchAlerts(!matchAlerts)}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold">Deadline reminders</p>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        Be reminded before important deadlines.
                      </p>
                    </div>
                    <Toggle
                      enabled={deadlineAlerts}
                      onChange={() => setDeadlineAlerts(!deadlineAlerts)}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold">Application updates</p>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        Stay updated on your application pipeline.
                      </p>
                    </div>
                    <Toggle
                      enabled={applicationAlerts}
                      onChange={() =>
                        setApplicationAlerts(!applicationAlerts)
                      }
                    />
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <SlidersHorizontal className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">Preferences</h2>
                    <p className="text-[11px] text-neutral-400">
                      Personalize your workspace.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <Moon className="h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-sm font-semibold">Appearance</p>
                        <p className="mt-0.5 text-xs text-neutral-400">
                          Currently using {theme === "dark" ? "dark" : "light"} mode.
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  </button>

                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Eye className="h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-sm font-semibold">Profile visibility</p>
                        <p className="mt-0.5 text-xs text-neutral-400">
                          Your profile stays private by default.
                        </p>
                      </div>
                    </div>

                    <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                      Private
                    </span>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <ShieldCheck className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">Privacy & security</h2>
                    <p className="text-[11px] text-neutral-400">
                      Manage your account protection.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-sm font-semibold">
                          Password & security
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-400">
                          Manage your sign-in and security settings.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-sm font-semibold">
                          Account information
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-400">
                          Manage your personal account details.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  </button>
                </div>
              </section>
            </div>

            <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                <ShieldCheck className="h-4 w-4" />
              </div>

              <h3 className="mt-4 text-sm font-bold">
                Your data stays yours
              </h3>

              <p className="mt-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                Your profile and future CV data are controlled by you.
                Opportunity Radar should never make your profile public
                without your permission.
              </p>

              <div className="mt-5 space-y-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Profile</span>
                  <span className="font-semibold">Private</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">CV sharing</span>
                  <span className="font-semibold">Off</span>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>
    </AppShell>
  );
}
