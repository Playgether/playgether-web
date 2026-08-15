import { Play } from "lucide-react";
import Image from "next/image";
import type { SharedCutContent } from "@/lib/sharedContent";
import { getCloudinaryVideoThumbnail } from "@/app/utils/getCloudinaryVideo";
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
  const thumbSrc = content.videoFile ? getCloudinaryVideoThumbnail(content.videoFile) : null;
  const avatarSrc = content.profilePhoto ? getCloudinaryUrl(content.profilePhoto) : null;
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
      <div className="flex items-start gap-1.5 p-2">
        <span className="mt-0.5 flex h-4 w-4 shrink-0 overflow-hidden rounded-full bg-white/10">
          {avatarSrc ? (
            <Image src={avatarSrc} alt="" width={16} height={16} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 text-[8px] font-bold text-white">
              {content.username[0]?.toUpperCase()}
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground">@{content.username}</p>
          {content.caption && (
            <p className="line-clamp-1 text-xs text-muted-foreground">{content.caption}</p>
          )}
        </div>
      </div>
    </button>
  );
}
