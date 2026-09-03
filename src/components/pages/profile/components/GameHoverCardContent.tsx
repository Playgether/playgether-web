"use client";
import { GameMediaImage } from "@/components/media/GameMediaImage";

type Props = {
  title: string;
  description?: string | null;
  logo?: string | null;
};

export function GameHoverCardContent({
  title,
  description,
  logo,
}: Props) {
  const hasLogo = Boolean(logo);

  return (
    <div className="max-h-64 overflow-y-auto pr-1 text-left">
      <div className="flex items-start gap-3">
        {hasLogo ? (
          <GameMediaImage
            src={logo}
            alt={`${title} logo`}
            size="icon"
            className="h-12 w-12 shrink-0 rounded-md border border-border bg-card/50"
            spinnerClassName="h-4 w-4"
          />
        ) : (
          <div className="h-12 w-12 shrink-0 rounded-md border border-border bg-card/50" />
        )}

        <div className="min-w-0">
          <div className="truncate font-semibold">{title}</div>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
