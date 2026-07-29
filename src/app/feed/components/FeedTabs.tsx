"use client";

import { cn } from "@/lib/utils";
import type { FeedMode } from "../types/FeedMode";

interface FeedTabsProps {
  mode: FeedMode;
  onChange: (mode: FeedMode) => void;
}

const TABS: { id: FeedMode; label: string }[] = [
  { id: "following", label: "Seguindo" },
  { id: "explore", label: "Explorar" },
];

export function FeedTabs({ mode, onChange }: FeedTabsProps) {
  return (
    <div className="mb-4 flex rounded-lg border border-border/60 bg-card p-0.5 shadow-sm lg:mb-6 lg:rounded-xl lg:p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 lg:rounded-lg lg:px-4 lg:py-2.5 lg:text-sm",
            mode === tab.id
              ? "bg-gradient-primary text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
