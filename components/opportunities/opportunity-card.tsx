"use client";

import {
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  Check,
  MapPin,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MatchScore } from "./match-score";

function formatPostedAt(value?: string) {
  if (!value) return "Posted date not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Posted date not available";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

type OpportunityCardProps = {
  title: string;
  organization: string;
  type: "Job" | "Scholarship" | "Grant" | "Fellowship" | "Hackathon";
  location: string;
  experience: string;
  salary?: string;
  postedAt?: string;
  matchScore: number;
  skills: string[];
  saved?: boolean;
  onSave?: () => void;
  onView?: () => void;
};

export function OpportunityCard({
  title,
  organization,
  type,
  location,
  experience,
  salary,
  postedAt,
  matchScore,
  skills,
  saved = false,
  onSave,
  onView,
}: OpportunityCardProps) {
  return (
    <Card className="group border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 sm:p-5">
      <div className="flex gap-4">
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 sm:flex">
          <BriefcaseBusiness className="h-[18px] w-[18px]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">{type}</Badge>
                <MatchScore score={matchScore} size="sm" />
              </div>

              <h3 className="mt-2 truncate text-[16px] font-bold tracking-tight text-neutral-950 dark:text-white">
                {title}
              </h3>

              <p className="mt-0.5 text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
                {organization}
              </p>
            </div>

            <button
              type="button"
              onClick={onSave}
              aria-label={saved ? "Remove from saved" : "Save opportunity"}
              className={`shrink-0 rounded-lg p-1.5 transition-colors ${
                saved
                  ? "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
                  : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
              }`}
            >
              <Bookmark
                className="h-[17px] w-[17px]"
                fill={saved ? "currentColor" : "none"}
              />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {location || "Location not listed"}
            </span>

            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span>{experience || "Experience not listed"}</span>

            {salary && (
              <>
                <span className="text-neutral-300 dark:text-neutral-700">·</span>
                <span>{salary}</span>
              </>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              >
                <Check className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                {skill}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <span className="text-[11px] text-neutral-400">
              {formatPostedAt(postedAt)}
            </span>

            <button
              type="button"
              onClick={onView}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:text-violet-600 dark:text-neutral-300 dark:hover:text-violet-400"
            >
              View opportunity
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
