"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  Eye,
  LogOut,
  Lock,
  Moon,
  Save,
  Shield,
  Sun,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/layout/theme-provider";
import { AppShell } from "@/components/layout/app-shell";

type Preferences = {
  opportunityAlerts: boolean;
  deadlineAlerts: boolean;
  applicationUpdates: boolean;
  profileVisible: boolean;
};

const defaultPreferences: Preferences = {
  opportunityAlerts: true,
  deadlineAlerts: true,
  applicationUpdates: true,
  profileVisible: true,
};

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { themeMode, resolvedTheme, setTheme } = useTheme();

  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      try {
        const stored = localStorage.getItem(
          `opportunity-radar-settings:${user.id}`
        );

        if (stored) {
          setPreferences({
            ...defaultPreferences,
            ...(JSON.parse(stored) as Partial<Preferences>),
          });
        }
      } catch {
        setPreferences(defaultPreferences);
      }

      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (queryError) {
        console.error("Settings profile lookup error:", queryError);
        setError("Unable to load your account settings.");
        setLoading(false);
        return;
      }

      if (!data) {
        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
          });

        if (upsertError) {
          console.error("Settings profile setup error:", upsertError);
          setError("Unable to prepare your account settings.");
        }
      }

      setLoading(false);
    }

    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updatePreference(
    key: keyof Preferences,
    value: boolean
  ) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
    setSaved(false);
  }

  function saveSettings() {
    setSaving(true);
    setSaved(false);
    setError("");

    if (!userId) {
      setError("Please sign in again.");
      setSaving(false);
      return;
    }

    try {
      localStorage.setItem(
        `opportunity-radar-settings:${userId}`,
        JSON.stringify(preferences)
      );

      setSaved(true);
    } catch {
      setError("Could not save your settings on this device.");
    }

    setSaving(false);
  }

  async function signOut() {
    if (signingOut) return;

    setSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError("Could not sign out. Please try again.");
      setSigningOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
          <div className="mx-auto w-full max-w-[1000px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
              Loading your settings...
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1000] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
            Preferences
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Settings
          </h1>

          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Control how Opportunity Radar works for you.
          </p>
        </div>

        <button
          type="button"
          onClick={saveSettings}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          {saved ? <Check size={15} /> : <Save size={15} />}
          {saving ? "Saving..." : saved ? "Saved" : "Save changes"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notifications */}
        <section className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 p-5 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <Bell size={17} />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  Notifications
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Choose which updates you want to receive.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            <SettingRow
              title="Opportunity alerts"
              description="Notify me about relevant new opportunities."
              checked={preferences.opportunityAlerts}
              onChange={(value) =>
                updatePreference("opportunityAlerts", value)
              }
            />

            <SettingRow
              title="Deadline reminders"
              description="Remind me when application deadlines are approaching."
              checked={preferences.deadlineAlerts}
              onChange={(value) =>
                updatePreference("deadlineAlerts", value)
              }
            />

            <SettingRow
              title="Application updates"
              description="Show updates about my application pipeline."
              checked={preferences.applicationUpdates}
              onChange={(value) =>
                updatePreference("applicationUpdates", value)
              }
            />
          </div>
        </section>

        {/* Appearance */}
        <section className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 p-5 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                {resolvedTheme === "dark" ? (
                  <Moon size={17} />
                ) : (
                  <Sun size={17} />
                )}
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  Appearance
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Choose how the dashboard looks.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-3 gap-2">
              <ThemeButton
                active={themeMode === "light"}
                icon={<Sun size={15} />}
                label="Light"
                onClick={() => setTheme("light")}
              />

              <ThemeButton
                active={themeMode === "dark"}
                icon={<Moon size={15} />}
                label="Dark"
                onClick={() => setTheme("dark")}
              />

              <ThemeButton
                active={themeMode === "system"}
                icon={<Shield size={15} />}
                label="System"
                onClick={() => setTheme("system")}
              />
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 p-5 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <Eye size={17} />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  Privacy
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Control how your profile is used.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <SettingRow
              title="Profile visibility"
              description="Allow your profile to be used for personalized matching."
              checked={preferences.profileVisible}
              onChange={(value) =>
                updatePreference("profileVisible", value)
              }
            />
          </div>
        </section>

        {/* Security */}
        <section className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 p-5 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <Lock size={17} />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  Security
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Your account is protected by Supabase authentication.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-3 dark:border-neutral-700">
              <div>
                <p className="text-xs font-medium">
                  Authentication
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Email authentication is active.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Check size={12} />
                Active
              </span>
            </div>

            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              <LogOut size={15} />
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </section>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
        <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
          Settings are stored for your signed-in account on this device.
          Your opportunity and application data remains protected by your
          Supabase account permissions.
        </p>
      </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs leading-5 text-neutral-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-neutral-950 dark:bg-white"
            : "bg-neutral-200 dark:bg-neutral-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full transition ${
            checked
              ? "left-6 bg-white dark:bg-neutral-950"
              : "left-1 bg-white dark:bg-neutral-400"
          }`}
        />
      </button>
    </div>
  );
}

function ThemeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center justify-center gap-1.5 rounded-xl border text-xs font-medium transition ${
        active
          ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
          : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
