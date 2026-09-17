"use client";

import { Check } from "lucide-react";

import type { CvAnalyzerResult } from "@/lib/ai/analyzer";

function AnalyzerList({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {items.map((item) => (
        <div key={item} className="flex gap-2.5">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p className="text-xs leading-5 text-neutral-600 dark:text-neutral-300">
            {item}
          </p>
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-bold">{title}</h3>
      <AnalyzerList items={items} />
    </div>
  );
}

export function CvAnalyzerResultView({
  result,
}: {
  result: CvAnalyzerResult;
}) {
  return (
    <div className="mt-5 space-y-5">
      <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
          CV summary
        </p>
        <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
          {result.cvSummary}
        </p>
      </div>

      <Section title="Strongest skills & evidence" items={result.strongestSkills} />
      <Section title="Relevant experience" items={result.relevantExperience} />
      <Section title="Strengths" items={result.strengths} />
      <Section title="Weak areas" items={result.weakAreas} />
      <Section
        title="Unclear or missing information"
        items={result.unclearOrMissingInformation}
      />
      <Section
        title="Skills needing stronger evidence"
        items={result.skillsNeedingStrongerEvidence}
      />
      <Section title="CV improvements" items={result.recommendations} />
      <Section title="Strongest role types" items={result.strongestRoleTypes} />
    </div>
  );
}
