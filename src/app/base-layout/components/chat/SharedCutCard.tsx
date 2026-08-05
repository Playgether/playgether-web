import { Play } from "lucide-react";
import Image from "next/image";
import type { SharedCutContent } from "@/lib/sharedContent";
import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";

function formatDuration(seconds: number | null): string | null {
  if (seconds == null || !Number.isFinite(seconds)) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SharedCutCard({
  content,
  onClick,
}: {
  content: SharedCutContent;
  onClick: () => void;
}) {
  const thumbSrc = content.thumbnail ? getCloudinaryUrl(content.thumbnail) : null;
  const duration = formatDuration(content.duration);

  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-56 overflow-hidden rounded-xl border border-white/10 bg-black/40 text-left transition hover:border-white/25"
    >
      <div className="relative flex aspect-[9/16] w-full items-center justify-center bg-black">
        {thumbSrc ? (
          <Image src={thumbSrc} alt="" fill className="object-cover" />
        ) : (
          <span className="text-xs text-white/40">Cut</span>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
            <Play className="h-4 w-4 fill-black text-black" />
          </span>
        </div>
        {duration && (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {duration}
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-xs font-semibold text-foreground">@{content.username}</p>
        {content.caption && (
          <p className="line-clamp-1 text-xs text-muted-foreground">{content.caption}</p>
        )}
      </div>
    </button>
  );
}
