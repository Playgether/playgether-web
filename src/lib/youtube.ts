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

export type YoutubeOEmbedMeta = {
  title: string;
  channelName: string;
  channelUrl: string;
  channelThumbnail: string;
  /** Ícone do canal (unavatar a partir do author_url do oEmbed). */
  channelAvatarUrl: string;
};

function safeHttpsYoutubeCdnUrl(raw: string | undefined): string {
  if (!raw || typeof raw !== "string") return "";
  const t = raw.trim();
  if (!t.startsWith("https://")) return "";
  try {
    const u = new URL(t);
    if (u.protocol !== "https:") return "";
    const h = u.hostname.toLowerCase();
    if (
      h === "i.ytimg.com" ||
      h.endsWith(".googleusercontent.com") ||
      h.endsWith("ggpht.com")
    ) {
      return t.slice(0, 512);
    }
    return "";
  } catch {
    return "";
  }
}

function safeYoutubeChannelUrl(raw: string | undefined): string {
  if (!raw || typeof raw !== "string") return "";
  const t = raw.trim();
  if (!isSafeYoutubeHttpUrl(t)) return "";
  return t.slice(0, 512);
}

/**
 * URL do avatar do canal no YouTube via unavatar (sem API key).
 * @see https://unavatar.io
 */
export function buildYoutubeChannelAvatarUrl(channelUrl: string): string {
  const u = channelUrl.trim();
  if (!u) return "";
  try {
    const url = new URL(u);
    const host = url.hostname.toLowerCase();
    if (!ALLOWED_HOSTS.has(host)) return "";
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "channel" && parts[1]?.startsWith("UC")) {
      return `https://unavatar.io/youtube/${encodeURIComponent(parts[1])}`;
    }
    if (parts[0]?.startsWith("@")) {
      return `https://unavatar.io/youtube/${encodeURIComponent(parts[0])}`;
    }
    if (parts[0] === "c" && parts[1]) {
      return `https://unavatar.io/youtube/${encodeURIComponent(parts[1])}`;
    }
    if (parts[0] === "user" && parts[1]) {
      return `https://unavatar.io/youtube/${encodeURIComponent(parts[1])}`;
    }
    return "";
  } catch {
    return "";
  }
}

const EMPTY_META: YoutubeOEmbedMeta = {
  title: "YouTube",
  channelName: "",
  channelUrl: "",
  channelThumbnail: "",
  channelAvatarUrl: "",
};

export async function fetchYoutubeOEmbedMeta(videoId: string): Promise<YoutubeOEmbedMeta> {
  if (!VIDEO_ID_RE.test(videoId)) {
    return { ...EMPTY_META };
  }
  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  const oembed = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watchUrl)}`;
  try {
    const res = await fetch(oembed);
    if (!res.ok) {
      return { ...EMPTY_META };
    }
    const data = (await res.json()) as {
      title?: string;
      author_name?: string;
      author_url?: string;
      thumbnail_url?: string;
    };
    const title =
      typeof data.title === "string" ? data.title.trim().slice(0, 200) || "YouTube" : "YouTube";
    const channelName =
      typeof data.author_name === "string" ? data.author_name.trim().slice(0, 200) : "";
    const channelUrl = safeYoutubeChannelUrl(data.author_url);
    const channelThumbnail = safeHttpsYoutubeCdnUrl(data.thumbnail_url);
    const channelAvatarUrl = buildYoutubeChannelAvatarUrl(channelUrl);
    return { title, channelName, channelUrl, channelThumbnail, channelAvatarUrl };
  } catch {
    return { ...EMPTY_META };
  }
}

export async function fetchYoutubeOEmbedTitle(videoId: string): Promise<string> {
  const m = await fetchYoutubeOEmbedMeta(videoId);
  return m.title;
}
