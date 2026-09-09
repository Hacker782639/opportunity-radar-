import * as React from "react";

type ProgressProps = {
  value: number;
  className?: string;
};

export function Progress({
  value,
  className = "",
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800 ${className}`}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-violet-600 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
