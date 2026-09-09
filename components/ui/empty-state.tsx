import { SearchX } from "lucide-react";
import * as React from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
        <SearchX className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-zinc-100">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-zinc-400">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
