"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const passwordStrong = password.length >= 8;
  const canContinue =
    name.trim().length > 1 &&
    email.trim().includes("@") &&
    passwordStrong;

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canContinue || loading) return;

    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: name.trim(),
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setVerificationSent(true);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  };

  if (verificationSent) {
    return (
      <main className="min-h-screen bg-[#fafaf8] px-6 py-10 text-[#111110] dark:bg-[#111110] dark:text-white">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[460px] items-center">
          <div className="w-full">
            <div className="mb-10 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111110] text-white dark:bg-white dark:text-[#111110]">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Opportunity Radar
              </span>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_70px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[#181817]">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111110] text-white dark:bg-white dark:text-[#111110]">
                <Mail className="h-6 w-6" />
              </div>

              <p className="mb-2 text-sm font-semibold text-neutral-500">
                One more step
              </p>

              <h1 className="text-3xl font-bold tracking-tight">
                Check your email
              </h1>

              <p className="mt-4 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                We sent a verification link to{" "}
                <span className="font-semibold text-[#111110] dark:text-white">
                  {email}
                </span>
                . Verify your email to continue setting up your Opportunity
                Radar.
              </p>

              <div className="mt-7 flex items-start gap-3 rounded-2xl border border-black/10 bg-[#fafaf8] p-4 dark:border-white/10 dark:bg-[#111110]">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                  After verification, return here and sign in. You’ll then
                  continue to onboarding automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#111110] text-sm font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-[#111110]"
              >
                Go to sign in
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-neutral-400">
              Didn’t receive it? Check your spam or promotions folder.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafaf8] px-6 py-10 text-[#111110] dark:bg-[#111110] dark:text-white">
      <div className="mx-auto max-w-[460px]">
        <div className="mb-10 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111110] text-white dark:bg-white dark:text-[#111110]">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Opportunity Radar
          </span>
        </div>

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-neutral-500">
            Get started
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Create your Radar
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Build a smarter way to discover opportunities that fit you.
          </p>
        </div>

        <div className="mb-6 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-black/10 bg-white text-sm font-semibold dark:border-white/10 dark:bg-[#181817]">
          <span className="text-lg font-bold">G</span>
          Continue with Google
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          <span className="text-xs font-medium text-neutral-400">OR</span>
          <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold">
              Full name
            </label>
            <div className="relative">
              <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="h-12 w-full rounded-xl border border-black/10 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black dark:border-white/10 dark:bg-[#181817] dark:focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="h-12 w-full rounded-xl border border-black/10 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black dark:border-white/10 dark:bg-[#181817] dark:focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold">
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="h-12 w-full rounded-xl border border-black/10 bg-white pl-11 pr-12 text-sm outline-none transition focus:border-black dark:border-white/10 dark:bg-[#181817] dark:focus:border-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  passwordStrong ? "bg-[#111110] dark:bg-white" : "bg-neutral-300"
                }`}
              />
              <span className="text-neutral-400">
                {passwordStrong ? "Strong password" : "Use 8+ characters"}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={!canContinue || loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#111110] text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-[#111110]"
          >
            {loading ? "Creating account..." : "Create account"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] leading-5 text-neutral-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>

        <p className="mt-7 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-semibold text-[#111110] dark:text-white"
          >
            Sign in
          </button>
        </p>

        <p className="mt-10 text-center text-xs text-neutral-400">
          © 2026 Opportunity Radar
        </p>
      </div>
    </main>
  );
}
