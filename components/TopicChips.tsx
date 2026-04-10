"use client";

import type { TopicCoverageState } from "@/lib/video-curation";

type TopicChipsProps = {
  topics: readonly {
    label: string;
    count?: number;
    coverageState?: TopicCoverageState;
    statusLabel?: string;
  }[];
  value: string;
  onChange: (topic: string) => void;
};

export function TopicChips({ topics, value, onChange }: TopicChipsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap">
      {topics.map((topic) => {
        const active = topic.label === value;
        const coverageState = topic.coverageState ?? "active";
        const className = active
          ? "filter-chip-active"
          : coverageState === "active"
            ? "filter-chip"
            : coverageState === "light"
              ? "filter-chip opacity-85 ring-1 ring-outline-variant/10"
              : "filter-chip opacity-55 ring-1 ring-outline-variant/10";

        return (
          <button
            key={topic.label}
            type="button"
            onClick={() => onChange(topic.label)}
            className={`${className} shrink-0`}
            aria-pressed={active}
            title={topic.statusLabel}
          >
            <span>{topic.label}</span>
            {topic.count !== undefined ? (
              <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] font-bold leading-none">
                {topic.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
