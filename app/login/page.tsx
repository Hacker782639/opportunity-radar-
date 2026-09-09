"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canContinue = email.trim() !== "" && password.trim() !== "";

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canContinue || loading) return;

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col px-5 py-8 sm:px-6 sm:py-10">
        <header className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
            <Sparkles className="h-4 w-4" />
          </div>

          <span className="text-sm font-bold tracking-tight">
            Opportunity Radar
          </span>
        </header>

        <section className="my-auto py-12">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">
              Welcome back
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Sign in to your Radar
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500 dark:text-neutral-400">
              Pick up where you left off and discover opportunities matched
              to your goals.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6"
          >
            <button
              type="button"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white text-sm font-semibold transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950 text-[10px] font-bold text-white dark:bg-white dark:text-neutral-950">
                G
              </span>
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                or
              </span>
              <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            </div>

            <div>
              <label className="text-xs font-bold">Email address</label>

              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold">Password</label>

                <button
                  type="button"
                  className="text-[11px] font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative mt-2">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-11 text-sm outline-none transition placeholder:text-neutral-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canContinue || loading}
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-neutral-950 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:pointer-events-none disabled:opacity-40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>

            <p className="mt-5 text-center text-xs text-neutral-400">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400"
            >
              Create one
            </button>
          </p>
        </section>

        <footer className="text-center text-[11px] text-neutral-400">
          © 2026 Opportunity Radar
        </footer>
      </div>
    </main>
  );
}
