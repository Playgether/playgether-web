"use client";
import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";

type Props = {
  title: string;
  description?: string | null;
  cover?: string | null;
  logo?: string | null;
};

function toMediaUrl(value?: string | null): string {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  if (value.startsWith("/")) return value;
  return getCloudinaryUrl(value);
}

export function GameHoverCardContent({
  title,
  description,
  cover,
  logo,
}: Props) {
  const coverUrl = toMediaUrl(cover);
  const logoUrl = toMediaUrl(logo);

  const hasCover = !!coverUrl;
  const hasLogo = !!logoUrl;

  return (
    <div className="space-y-3 text-left max-h-64 overflow-y-auto pr-1">
      {hasCover ? (
        <img
          src={coverUrl}
          alt={`${title} cover`}
          className="w-full h-24 object-contain rounded-md bg-card/50"
        />
      ) : (
        <div className="w-full h-24 rounded-md bg-card/50 border border-border" />
      )}

      <div className="flex items-start gap-3">
        {hasLogo ? (
          <img
            src={logoUrl}
            alt={`${title} logo`}
            className="w-12 h-12 rounded-md object-contain bg-card/50 border border-border"
          />
        ) : (
          <div className="w-12 h-12 rounded-md bg-card/50 border border-border" />
        )}

        <div className="min-w-0">
          <div className="font-semibold truncate">{title}</div>
          {description ? (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

