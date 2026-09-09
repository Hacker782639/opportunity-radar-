"use client";

import * as React from "react";

type Tab = {
  id: string;
  label: string;
};

type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
};

export function Tabs({
  tabs,
  activeTab,
  onChange,
}: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-slate-200 dark:border-zinc-800">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-3 text-sm font-medium transition-colors ${
              active
                ? "text-violet-600 dark:text-violet-400"
                : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {tab.label}

            {active && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-violet-600" />
            )}
          </button>
        );
      })}
    </div>
  );
}
