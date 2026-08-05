import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCutById } from "@/actions/getCuts";
import { getCloudinaryVideoUrl } from "@/app/utils/getCloudinaryVideo";
import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";

export default async function CutEmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cut = await getCutById(id);
  if (!cut) notFound();

  const avatarSrc = cut.profile_photo ? getCloudinaryUrl(cut.profile_photo) : null;

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-black">
      <div className="relative flex-1">
        <video
          src={getCloudinaryVideoUrl(cut.video_file)}
          className="h-full w-full object-contain"
          controls
          loop
          muted
          autoPlay
          playsInline
        />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full ring-1 ring-white/70">
            {avatarSrc ? (
              <Image src={avatarSrc} alt={cut.username} width={28} height={28} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 text-xs font-bold text-white">
                {cut.username[0]?.toUpperCase()}
              </span>
            )}
          </span>
          <span className="text-xs font-semibold text-white drop-shadow">@{cut.username}</span>
        </div>
      </div>
      <Link
        href={`/cuts/${cut.id}`}
        target="_blank"
        rel="noopener"
        className="flex items-center justify-center gap-1.5 border-t border-white/10 bg-black py-2 text-xs font-medium text-white/70 hover:text-white"
      >
        Ver no Playgether
      </Link>
    </div>
  );
}
