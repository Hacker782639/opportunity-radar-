"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Compass,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

const mainLinks = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "For You", href: "/for-you", icon: Sparkles },
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Applications", href: "/applications", icon: BriefcaseBusiness },
  { label: "Deadlines", href: "/deadlines", icon: CalendarDays },
];

const accountLinks = [
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "CV & Resume", href: "/cv", icon: FileText },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[238px] flex-col border-r border-neutral-200 bg-[#fafaf8] transition-transform duration-200 dark:border-neutral-800 dark:bg-[#111110] lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[68px] items-center justify-between border-b border-neutral-200 px-5 dark:border-neutral-800">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>

            <span className="text-[15px] font-bold tracking-tight text-neutral-950 dark:text-white">
              Opportunity Radar
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 lg:hidden dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
            Workspace
          </p>

          <div className="space-y-0.5">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`group flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-[17px] w-[17px]" />
                  {link.label}

                  {link.label === "For You" && (
                    <span
                      className={`ml-auto h-1.5 w-1.5 rounded-full ${
                        active ? "bg-violet-400" : "bg-violet-500"
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <p className="px-2 pb-2 pt-8 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
            Account
          </p>

          <div className="space-y-0.5">
            {accountLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-[17px] w-[17px]" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
          <div className="rounded-xl border border-neutral-200 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                Profile strength
              </span>

              <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                66%
              </span>
            </div>

            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div className="h-full w-2/3 rounded-full bg-violet-600" />
            </div>

            <Link
              href="/profile"
              className="mt-2.5 block text-xs font-medium text-neutral-500 hover:text-violet-600 dark:text-neutral-400 dark:hover:text-violet-400"
            >
              Complete profile →
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
