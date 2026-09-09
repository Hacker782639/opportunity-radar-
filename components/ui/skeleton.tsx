import * as React from "react";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({
  className = "",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 dark:bg-zinc-800 ${className}`}
      {...props}
    />
  );
}
