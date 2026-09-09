"use client";

import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import * as React from "react";

type ToastVariant = "success" | "info" | "warning" | "error";

type ToastProps = {
  message: string;
  variant?: ToastVariant;
  onClose?: () => void;
};

export function Toast({
  message,
  variant = "info",
  onClose,
}: ToastProps) {
  const icons = {
    success: CheckCircle2,
    info: Info,
    warning: TriangleAlert,
    error: TriangleAlert,
  };

  const Icon = icons[variant];

  return (
    <div className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <Icon
        className={`h-5 w-5 shrink-0 ${
          variant === "success"
            ? "text-green-600"
            : variant === "warning"
              ? "text-amber-600"
              : variant === "error"
                ? "text-red-600"
                : "text-violet-600"
        }`}
      />

      <p className="flex-1 text-sm font-medium text-slate-700 dark:text-zinc-200">
        {message}
      </p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
