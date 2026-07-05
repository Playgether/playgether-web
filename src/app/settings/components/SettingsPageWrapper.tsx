import React from "react";
import { Separator } from "@/components/ui/separator";

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsPageWrapper({ title, description, children }: Props) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Separator className="opacity-50" />
      {children}
    </div>
  );
}

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
