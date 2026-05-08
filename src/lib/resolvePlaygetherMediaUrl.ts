import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";

/**
 * Resolve profile/media URLs like chat and ProfileAvatar:
 * absolute URLs pass through; paths starting with `/` use the app origin;
 * otherwise treats the value as Cloudinary `public_id` (same as comentários / perfil).
 */
export function resolvePlaygetherMediaUrl(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("//")) return `https:${t}`;
  if (t.startsWith("/")) {
    const base =
      (typeof process !== "undefined" &&
        typeof process.env.NEXT_PUBLIC_APP_URL === "string" &&
        process.env.NEXT_PUBLIC_APP_URL.trim()) ||
      (typeof window !== "undefined" ? window.location.origin : "");
    if (!base) return t;
    const clean = base.replace(/\/$/, "");
    return `${clean}${t}`;
  }
  return getCloudinaryUrl(t);
}
