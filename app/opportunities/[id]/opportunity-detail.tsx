"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  Check,
  Clock3,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Job } from "@/lib/jobs/types";
import type { MatchResult } from "@/lib/jobs/matching";
import type {
  AnalyzerMode,
  CvAnalyzerResult,
  OpportunityAnalyzerResult,
} from "@/lib/ai/analyzer";
import { CvAnalyzerResultView } from "@/components/ai/cv-analyzer-result";

import { AppShell } from "@/components/layout/app-shell";

function formatDescription(value?: string) {
  if (!value) return [];

  const text = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|h[1-6])>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

type OpportunityDetailProps = {
  initialJob: Job;
  initialMatch: MatchResult | null;
  opportunityId: string;
};

type ExternalListingDialog = {
  open: boolean;
  checking: boolean;
  warning: string | null;
};

export function OpportunityDetail({
  initialJob,
  initialMatch,
  opportunityId,
}: OpportunityDetailProps) {
  const supabase = useMemo(() => createClient(), []);
  const job = initialJob;
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<AnalyzerMode>("opportunity");
  const [analysis, setAnalysis] = useState<
    CvAnalyzerResult | OpportunityAnalyzerResult | null
  >(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [externalListing, setExternalListing] = useState<ExternalListingDialog>({
    open: false,
    checking: false,
    warning: null,
  });
  const opportunity = {
    title: job.title,
    organization: job.company,
    type: job.category || "Opportunity",
    location: job.remote
      ? `${job.location || "Location not listed"} · Remote`
      : job.location || "Location not listed",
    experience: job.experience || "Not listed",
    salary: job.salary || "Salary not listed",
    posted: job.publishedAt || "Posted date not available",
    source: job.source,
  };
  const descriptionParagraphs = formatDescription(job.description);
  const skills = initialMatch
    ? [...initialMatch.matchedSkills, ...initialMatch.missingSkills]
    : job.skills;

  useEffect(() => {
    const loadState = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [savedResult, applicationResult] = await Promise.all([
        supabase.from("saved_opportunities").select("id").eq("user_id", user.id).eq("opportunity_id", opportunityId).maybeSingle(),
        supabase.from("applications").select("id").eq("user_id", user.id).eq("opportunity_id", opportunityId).maybeSingle(),
      ]);
      if (savedResult.error) console.error("Saved opportunity lookup error:", savedResult.error);
      else setSaved(Boolean(savedResult.data));
      if (applicationResult.error) console.error("Application lookup error:", applicationResult.error);
      else setApplied(Boolean(applicationResult.data));
    };
    loadState();
  }, [opportunityId, supabase]);

  const toggleSave = async () => {
    if (!job || saving) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setSaving(false);
    if (saved) {
      const { error } = await supabase.from("saved_opportunities").delete().eq("user_id", user.id).eq("opportunity_id", job.id);
      if (!error) setSaved(false); else console.error("Remove saved opportunity error:", error);
    } else {
      const { error } = await supabase.from("saved_opportunities").insert({
        user_id: user.id, opportunity_id: job.id, title: job.title, company: job.company,
        location: job.location, remote: job.remote, experience: job.experience,
        salary: job.salary ?? null, url: job.url, source: job.source,
        published_at: job.publishedAt ? new Date(job.publishedAt).toISOString() : null,
        skills: job.skills,
      });
      if (!error) setSaved(true); else console.error("Save opportunity error:", error);
    }
    setSaving(false);
  };

  const apply = async () => {
    if (!job || applying || applied) return;
    setApplying(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setApplying(false);
    const { error } = await supabase.from("applications").insert({
      user_id: user.id, opportunity_id: job.id, title: job.title, company: job.company,
      location: job.location, url: job.url, source: job.source,
      match_score: initialMatch?.score ?? null, deadline: job.deadline ?? null,
      status: "Applied", next_step: "Awaiting response", applied_at: new Date().toISOString(),
    });
    if (!error || error.code === "23505") setApplied(true);
    else console.error("Apply error:", error);
    setApplying(false);
  };

  const runAnalysis = async (mode: AnalyzerMode) => {
    if (analyzing) return;

    setAnalysisMode(mode);
    setAnalysis(null);
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          opportunity: {
            ...(mode === "opportunity"
              ? {
                  title: job.title,
                  company: job.company,
                  description: job.description,
                  experience: job.experience,
                  skills: job.skills,
                  location: job.location,
                  remote: job.remote,
                  salary: job.salary,
                  source: job.source,
                }
              : {}),
          },
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Unable to analyze this opportunity",
        );
      }

      if (!data?.result) {
        throw new Error("AI returned no analysis");
      }

      setAnalysisMode(mode);
      setAnalysis(data.result);
    } catch (error) {
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "AI analysis is temporarily unavailable",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const isJobicyListing = job.source.trim().toLowerCase() === "jobicy";

  const checkJobicyListing = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    setExternalListing({
      open: true,
      checking: true,
      warning: null,
    });

    try {
      await fetch(job.url, {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-store",
        signal: controller.signal,
      });
    } catch {
      setExternalListing({
        open: true,
        checking: false,
        warning:
          "We couldn't reach this Jobicy listing from your browser. The external source may currently be unavailable.",
      });
      return;
    } finally {
      clearTimeout(timeout);
    }

    setExternalListing({
      open: true,
      checking: false,
      warning: null,
    });
  };

  const closeExternalListing = () => {
    setExternalListing((current) => ({
      ...current,
      open: false,
    }));
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 transition hover:text-neutral-950 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Discover
          </Link>

          <section className="mt-6 rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="p-5 sm:p-7">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                        {opportunity.type}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
                        <Sparkles className="h-3 w-3" />
                        {initialMatch ? `${initialMatch.score}% match` : "Match unavailable"}
                      </span>
                    </div>

                    <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                      {opportunity.title}
                    </h1>

                    <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      {opportunity.organization}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleSave}
                    disabled={!job || saving}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-300 dark:hover:text-white"
                  >
                    <Bookmark className="h-4 w-4" />
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={apply}
                    disabled={!job || applying || applied}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-neutral-950 px-4 text-xs font-bold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                  >
                    {applying ? "Applying..." : applied ? "Applied" : "Apply"}
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 border-t border-neutral-100 pt-5 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {opportunity.location}
                </span>

                <span>{opportunity.experience}</span>

                <span>{opportunity.salary}</span>

                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  {opportunity.posted}
                </span>
              </div>
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">

            <div className="space-y-6">

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <h2 className="text-sm font-bold">Why this matches you</h2>

                {initialMatch ? (
                  initialMatch.reasons.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {initialMatch.reasons.map((reason) => (
                        <div key={reason} className="flex gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                            <Check className="h-3 w-3" />
                          </span>
                          <p className="text-xs leading-5 text-neutral-600 dark:text-neutral-300">
                            {reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-xs leading-5 text-neutral-600 dark:text-neutral-300">
                      No specific match reasons are available for this opportunity.
                    </p>
                  )
                ) : (
                  <p className="mt-4 text-xs leading-5 text-neutral-600 dark:text-neutral-300">
                    Match details are unavailable until your profile has matching
                    information.
                  </p>
                )}
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-neutral-700 dark:text-neutral-200" />
                      <h2 className="text-sm font-bold">AI Analyzer</h2>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                      Analyze your CV independently or get practical guidance
                      before applying.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void runAnalysis("cv")}
                      disabled={analyzing}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-bold text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800 dark:text-neutral-300 dark:hover:text-white"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {analyzing && analysisMode === "cv"
                        ? "Analyzing my CV..."
                        : "Analyze my CV"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void runAnalysis("opportunity")}
                      disabled={analyzing}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-3 text-xs font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {analyzing && analysisMode === "opportunity"
                        ? "Analyzing opportunity..."
                        : "Analyze opportunity"}
                    </button>
                  </div>
                </div>

                {analysisError ? (
                  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                      {analysisError}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-neutral-500 dark:text-neutral-400">
                      Your existing profile match is still available above.
                    </p>
                  </div>
                ) : null}

                {analysis && "cvSummary" in analysis ? (
                  <CvAnalyzerResultView result={analysis} />
                ) : analysis && "assessment" in analysis ? (
                  <div className="mt-5 space-y-5">
                    <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                        Assessment
                      </p>
                      <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                        {analysis.assessment}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="inline-flex rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          {analysis.recommendedAction}
                        </span>

                        <span className="inline-flex rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          {analysis.readiness}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold">Evidence from CV</h3>
                      <div className="mt-3 space-y-2">
                        {analysis.evidenceFromCv.map((item) => (
                          <div key={item} className="flex gap-2.5">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <p className="text-xs leading-5 text-neutral-600 dark:text-neutral-300">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold">Relevant strengths</h3>
                      <div className="mt-3 space-y-2">
                        {analysis.relevantStrengths.map((item) => (
                          <div key={item} className="flex gap-2.5">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <p className="text-xs leading-5 text-neutral-600 dark:text-neutral-300">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold">Potential gaps</h3>
                      <div className="mt-3 space-y-2">
                        {analysis.potentialGaps.map((item) => (
                          <p
                            key={item}
                            className="text-xs leading-5 text-neutral-600 dark:text-neutral-300"
                          >
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold">Requirements to verify</h3>
                      <div className="mt-3 space-y-2">
                        {analysis.requirementsToVerify.map((item) => (
                          <p
                            key={item}
                            className="text-xs leading-5 text-neutral-600 dark:text-neutral-300"
                          >
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold">Application risks</h3>
                      <div className="mt-3 space-y-2">
                        {analysis.applicationRisks.map((item) => (
                          <p
                            key={item}
                            className="text-xs leading-5 text-neutral-600 dark:text-neutral-300"
                          >
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold">What to improve</h3>
                      <div className="mt-3 space-y-2">
                        {analysis.whatToImprove.map((item) => (
                          <p
                            key={item}
                            className="text-xs leading-5 text-neutral-600 dark:text-neutral-300"
                          >
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold">What to highlight</h3>
                      <div className="mt-3 space-y-2">
                        {analysis.whatToHighlight.map((item) => (
                          <p
                            key={item}
                            className="text-xs leading-5 text-neutral-600 dark:text-neutral-300"
                          >
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-950">
                    <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                      Choose a manual analysis. Your profile match above stays
                      separate and unchanged.
                    </p>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <h2 className="text-sm font-bold">About the opportunity</h2>

                {descriptionParagraphs.length > 0 ? (
                  descriptionParagraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className="mt-4 text-sm leading-7 text-neutral-600 dark:text-neutral-300"
                    >
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="mt-4 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                    No description provided by this source.
                  </p>
                )}
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <h2 className="text-sm font-bold">Skills</h2>

                {skills.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-xs leading-5 text-neutral-600 dark:text-neutral-300">
                    No skills listed by this source.
                  </p>
                )}
              </section>

            </div>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Match quality
                </p>

                <div className="mt-3 flex items-end justify-between">
                  <span className="text-3xl font-bold tracking-tight">
                    {initialMatch ? `${initialMatch.score}%` : "–"}
                  </span>

                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                    {initialMatch ? "Calculated fit" : "Unavailable"}
                  </span>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-violet-600"
                    style={{ width: initialMatch ? `${initialMatch.score}%` : 0 }}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Opportunity details
                </p>

                <div className="mt-4 space-y-4 text-xs">
                  <div>
                    <p className="text-neutral-400">Experience</p>
                    <p className="mt-1 font-semibold">{opportunity.experience}</p>
                  </div>

                  <div>
                    <p className="text-neutral-400">Location</p>
                    <p className="mt-1 font-semibold">{opportunity.location}</p>
                  </div>

                  <div>
                    <p className="text-neutral-400">Compensation</p>
                    <p className="mt-1 font-semibold">{opportunity.salary}</p>
                  </div>

                  <div>
                    <p className="text-neutral-400">Source</p>
                    <p className="mt-1 font-semibold">{opportunity.source}</p>
                  </div>
                </div>
              </section>

              {isJobicyListing ? (
                <button
                  type="button"
                  onClick={() => void checkJobicyListing()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs font-bold text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                >
                  Open original listing
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              ) : (
                <a
                  href={job?.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs font-bold text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                >
                  Open original listing
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </aside>

          </div>

          {externalListing.open ? (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="external-listing-title"
              className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/50 p-4 sm:items-center"
            >
              <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                      External source
                    </p>
                    <h2
                      id="external-listing-title"
                      className="mt-2 text-sm font-bold"
                    >
                      Continue to Jobicy
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={closeExternalListing}
                    className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
                    aria-label="Close external listing dialog"
                  >
                    ×
                  </button>
                </div>

                <p className="mt-3 text-xs leading-5 text-neutral-600 dark:text-neutral-300">
                  You are leaving Opportunity Radar. The original Jobicy listing
                  will open in a new tab.
                </p>

                {externalListing.checking ? (
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700 dark:border-neutral-700 dark:border-t-neutral-200" />
                    Checking the external listing...
                  </div>
                ) : null}

                {externalListing.warning ? (
                  <div
                    role="alert"
                    className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <p className="text-xs leading-5 text-neutral-700 dark:text-neutral-300">
                      {externalListing.warning}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-neutral-500 dark:text-neutral-400">
                      The original link is preserved. You can still try it or
                      return later.
                    </p>
                  </div>
                ) : null}

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={closeExternalListing}
                    className="h-9 flex-1 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-300 dark:hover:text-white"
                  >
                    Stay here
                  </button>

                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeExternalListing}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-3 text-xs font-bold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                  >
                    Continue
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </AppShell>
  );
}
