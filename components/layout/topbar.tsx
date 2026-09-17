"use client";

import {
  Bell,
  Menu,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";

type TopbarProps = {
  onMenuClick?: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [search, setSearch] = useState("");
  const [displayName, setDisplayName] = useState("User");

  useEffect(() => {
    const loadDisplayName = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Topbar profile lookup error:", error);
      }

      const name =
        data?.full_name ||
        (typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : "") ||
        (typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name
          : "") ||
        user.email?.split("@")[0];

      if (name) {
        setDisplayName(name);
      }
    };

    loadDisplayName();
  }, [supabase]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/discover?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-4 border-b border-neutral-200 bg-[#fafaf8]/90 px-4 backdrop-blur-xl dark:border-neutral-800 dark:bg-[#111110]/90 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 lg:hidden dark:hover:bg-neutral-900 dark:hover:text-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      <form
        onSubmit={submitSearch}
        className="relative hidden w-full max-w-sm sm:block"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search opportunities..."
          className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-10 text-[13px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
        />

        <kbd className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-400 sm:block dark:border-neutral-700">
          /
        </kbd>
      </form>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={() => router.push("/notifications")}
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-white"
        >
          <Bell className="h-[18px] w-[18px]" />

          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-violet-600" />
        </button>

        <div className="ml-2 border-l border-neutral-200 pl-3 dark:border-neutral-800">
          <Avatar name={displayName} size="sm" />
        </div>
      </div>
    </header>
  );
}
