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
    <div className="mb-6 flex rounded-xl border border-border/50 bg-muted/20 p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200",
            mode === tab.id
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
