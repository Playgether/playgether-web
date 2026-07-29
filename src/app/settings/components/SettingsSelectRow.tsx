"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
}

interface SettingsSelectRowProps {
  label: string;
  description?: string;
  value: string;
  options: Option[];
  onValueChange: (v: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function SettingsSelectRow({
  label,
  description,
  value,
  options,
  onValueChange,
  disabled,
  loading,
}: SettingsSelectRowProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-40 shrink-0 bg-background/50 border-border/50 rounded-lg text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
