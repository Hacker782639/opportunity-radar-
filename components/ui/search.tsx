"use client";

import { Search as SearchIcon, X } from "lucide-react";
import * as React from "react";

type SearchProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onClear?: () => void;
};

export function Search({
  value,
  onClear,
  className = "",
  ...props
}: SearchProps) {
  const hasValue = Boolean(value);

  return (
    <div className={`relative w-full ${className}`}>
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />

      <input
        value={value}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        {...props}
      />

      {hasValue && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
