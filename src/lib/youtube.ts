/**
 * Validação e parsing de URLs do YouTube (apenas HTTPS, hosts oficiais).
 * Evita caminhos locais (file:, C:\) e javascript:.
 */

const ALLOWED_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export function isSafeYoutubeHttpUrl(raw: string): boolean {
  const s = raw.trim();
  if (!s || s.length > 2048) return false;
  const lower = s.toLowerCase();
  if (
    lower.startsWith("file:") ||
    lower.startsWith("\\\\") ||
    /^[a-z]:[\\/]/i.test(s)
  ) {
    return false;
  }
  let url: URL;
  try {
    url = new URL(s);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.has(host)) return false;
  return true;
}

/**
 * Extrai o primeiro video ID de 11 caracteres de uma URL YouTube válida.
 * Retorna null se não for possível obter um ID seguro.
 */
export function extractYoutubeVideoId(raw: string): string | null {
  if (!isSafeYoutubeHttpUrl(raw)) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (host === "youtu.be" || host === "www.youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    return VIDEO_ID_RE.test(id) ? id : null;
  }

  const v = url.searchParams.get("v");
  if (v && VIDEO_ID_RE.test(v)) return v;

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "embed" && parts[1] && VIDEO_ID_RE.test(parts[1])) {
    return parts[1];
  }
  if (parts[0] === "shorts" && parts[1] && VIDEO_ID_RE.test(parts[1])) {
    return parts[1];
  }

  return null;
}

export async function fetchYoutubeOEmbedTitle(videoId: string): Promise<string> {
  if (!VIDEO_ID_RE.test(videoId)) return "YouTube";
  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  const oembed = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watchUrl)}`;
  try {
    const res = await fetch(oembed);
    if (!res.ok) return "YouTube";
    const data = (await res.json()) as { title?: string };
    const t = typeof data.title === "string" ? data.title.trim() : "";
    return t.slice(0, 200) || "YouTube";
  } catch {
    return "YouTube";
  }
}
