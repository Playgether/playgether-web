"use client";

import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SettingsToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
}

export function SettingsToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  loading,
  danger,
}: SettingsToggleRowProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-6 w-11 rounded-full" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl transition-colors",
        danger ? "bg-destructive/5 hover:bg-destructive/10" : "bg-muted/20 hover:bg-muted/30"
      )}
    >
      <div className="flex-1 min-w-0 mr-4">
        <p className={cn("text-sm font-medium", danger ? "text-destructive" : "text-foreground")}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="data-[state=checked]:bg-primary shrink-0"
      />
    </div>
  );
}
