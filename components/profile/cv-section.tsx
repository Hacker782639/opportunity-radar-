"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { CvAnalyzerResultView } from "@/components/ai/cv-analyzer-result";
import type { CvAnalyzerResult } from "@/lib/ai/analyzer";
import {
  formatCvUploadedAt,
  loadStoredCv,
  removeCv,
  uploadCv,
  validateCvFile,
  type StoredCV,
} from "@/lib/cv/client";

export function ProfileCvSection({
  supabase,
  onCvChange,
}: {
  supabase: SupabaseClient;
  onCvChange?: (hasCv: boolean) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [storedCv, setStoredCv] = useState<StoredCV | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CvAnalyzerResult | null>(null);
  const [analysisError, setAnalysisError] = useState("");

  useEffect(() => {
    let active = true;

    const loadCv = async () => {
      try {
        const cv = await loadStoredCv(supabase);

        if (active) {
          setStoredCv(cv);
          onCvChange?.(Boolean(cv));
        }
      } catch (loadError) {
        if (!active) return;

        console.error("Profile CV lookup error:", loadError);
        setError("Unable to load your CV.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCv();

    return () => {
      active = false;
    };
  }, [supabase, onCvChange]);

  const handleFile = async (file?: File) => {
    if (!file || uploading || removing) return;

    const validationError = validateCvFile(file);

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");
    setAnalysis(null);
    setAnalysisError("");
    setUploading(true);

    try {
      const { cv, warning } = await uploadCv(supabase, file);

      setStoredCv(cv);
      onCvChange?.(true);
      setError(warning ?? "");
      setSuccess(warning ? "" : "CV uploaded.");
    } catch (uploadError) {
      console.error("Profile CV upload error:", uploadError);
      setError("Unable to upload your CV. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeStoredCv = async () => {
    if (!storedCv || uploading || removing) return;

    setError("");
    setSuccess("");
    setAnalysis(null);
    setAnalysisError("");
    setRemoving(true);

    try {
      const warning = await removeCv(supabase, storedCv);

      setStoredCv(null);
      onCvChange?.(false);
      setError(warning ?? "");
      setSuccess(warning ? "" : "CV removed.");
    } catch (removeError) {
      console.error("Profile CV removal error:", removeError);
      setError("Unable to remove your CV. Please try again.");
    } finally {
      setRemoving(false);
    }
  };

  const runCvAnalysis = async () => {
    if (analyzing || !storedCv) return;

    setAnalyzing(true);
    setAnalysis(null);
    setAnalysisError("");
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode: "cv" }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Unable to analyze your CV",
        );
      }

      if (!data?.result) {
        throw new Error("AI returned no CV analysis");
      }

      setAnalysis(data.result);
    } catch (analyzeError) {
      setAnalysisError(
        analyzeError instanceof Error
          ? analyzeError.message
          : "AI analysis is temporarily unavailable",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-neutral-400" />
            <h2 className="text-sm font-bold">CV & Resume</h2>
          </div>

          <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            Store one private CV and use it when you choose AI analysis.
          </p>
        </div>

        {storedCv ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || removing}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800 dark:text-neutral-300 dark:hover:text-white"
          >
            <Upload className="h-3.5 w-3.5" />
            Replace CV
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading your CV...
        </div>
      ) : storedCv ? (
        <div className="mt-5 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-start gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              <FileText className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">{storedCv.fileName}</p>
              <p className="mt-1 text-[11px] text-neutral-400">
                {formatCvUploadedAt(storedCv.uploadedAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-neutral-100 p-4 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => router.push("/cv/review")}
              disabled={uploading || removing}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800 dark:text-neutral-300 dark:hover:text-white"
            >
              <Eye className="h-3.5 w-3.5" />
              Review CV
            </button>

            <button
              type="button"
              onClick={() => void removeStoredCv()}
              disabled={uploading || removing}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800 dark:text-neutral-300 dark:hover:text-white"
            >
              {removing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-neutral-300 p-4 dark:border-neutral-700">
          <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            No CV uploaded yet. CV analysis requires a CV upload.
          </p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-neutral-950 px-4 text-xs font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {uploading ? "Uploading..." : "Upload CV"}
          </button>

          <p className="mt-3 text-[11px] text-neutral-400">
            Supported formats: PDF/DOCX · Maximum 10 MB
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => void runCvAnalysis()}
        disabled={analyzing || uploading || removing || !storedCv}
        className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800 dark:text-neutral-300 dark:hover:text-white"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {analyzing ? "Analyzing my CV..." : "Analyze my CV"}
      </button>

      {uploading ? (
        <p className="mt-3 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
          Uploading your CV securely...
        </p>
      ) : null}

      {success ? (
        <p className="mt-3 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          {success}
        </p>
      ) : null}

      {error ? (
        <div role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      ) : null}

      {analysisError ? (
        <div role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {analysisError}
        </div>
      ) : null}

      {analysis ? <CvAnalyzerResultView result={analysis} /> : null}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
        }}
      />
    </section>
  );
}
