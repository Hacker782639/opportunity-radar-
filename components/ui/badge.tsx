import * as React from "react";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
    primary:
      "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
    success:
      "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    warning:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    danger:
      "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
