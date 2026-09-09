"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  FileText,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

export default function CVPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    const validType =
      selectedFile.type === "application/pdf" ||
      selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!validType) return;

    setFile(selectedFile);
    setUploaded(true);
  };

  const removeFile = () => {
    setFile(null);
    setUploaded(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-[#fafaf8] text-neutral-950 dark:bg-[#111110] dark:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[850px] flex-col px-4 py-6 sm:px-6 lg:py-10">

        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
              <Sparkles className="h-4 w-4" />
            </div>

            <span className="text-sm font-bold tracking-tight">
              Opportunity Radar
            </span>
          </div>

          <span className="text-xs text-neutral-400">
            CV profile
          </span>
        </header>

        <section className="mt-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">
            Optional
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Add your CV
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">
            Let Radar extract useful information from your CV to improve
            opportunity matching. You stay in control of every change.
          </p>
        </section>

        <section className="mt-8">
          {!file ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                handleFile(event.dataTransfer.files[0]);
              }}
              className={`flex min-h-[280px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition ${
                dragging
                  ? "border-violet-400 bg-violet-50/60 dark:bg-violet-500/10"
                  : "border-neutral-300 bg-white hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                <Upload className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-sm font-bold">
                Drop your CV here
              </h2>

              <p className="mt-1 text-xs text-neutral-400">
                or click to browse from your device
              </p>

              <span className="mt-5 rounded-lg bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950">
                Choose file
              </span>

              <p className="mt-4 text-[10px] text-neutral-400">
                PDF or DOCX · Maximum 10 MB
              </p>
            </button>
          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {file.name}
                  </p>

                  <p className="mt-1 text-[11px] text-neutral-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · Ready to
                    process
                  </p>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  aria-label="Remove CV"
                  className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="border-t border-neutral-100 px-5 py-4 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                    <Check className="h-3 w-3" />
                  </span>
                  File accepted
                </div>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            "Extract skills",
            "Identify experience",
            "Improve matching",
          ].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <Check className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              <p className="mt-3 text-xs font-semibold">{item}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-xl border border-violet-100 bg-violet-50/60 p-5 dark:border-violet-500/20 dark:bg-violet-500/5">
          <div className="flex gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />

            <div>
              <h2 className="text-sm font-bold">
                You review everything
              </h2>

              <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                Radar will propose profile changes from your CV. Nothing
                should silently overwrite your existing information.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-8 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="text-xs font-semibold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            Skip for now
          </button>

          <button
            type="button"
            disabled={!uploaded}
            onClick={() => router.push("/cv/review")}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:pointer-events-none disabled:opacity-40"
          >
            Continue
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </footer>
      </div>
    </main>
  );
}
