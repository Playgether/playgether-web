/**
 * Client-side URL validation and provider detection for supported media sources.
 * The backend does the authoritative parsing — this is a lightweight pre-check
 * to give immediate feedback before hitting the network.
 */

import type { ProviderName } from "@/types/RoomMusic";

const YT_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

const SPOTIFY_HOSTS = new Set(["open.spotify.com", "spotify.link"]);
const DEEZER_HOSTS = new Set(["www.deezer.com", "deezer.com"]);

function parseHost(raw: string): string | null {
  if (!raw || !raw.startsWith("https://")) return null;
  try {
    return new URL(raw.trim()).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** Returns true if the URL is from a supported media provider (YouTube, Spotify, Deezer). */
export function isSupportedMediaUrl(raw: string): boolean {
  const host = parseHost(raw.trim());
  if (!host) return false;
  return YT_HOSTS.has(host) || SPOTIFY_HOSTS.has(host) || DEEZER_HOSTS.has(host);
}

/** Detects which provider a URL belongs to, or null if unrecognized. */
export function detectProviderFromUrl(raw: string): ProviderName | null {
  const host = parseHost(raw.trim());
  if (!host) return null;
  if (YT_HOSTS.has(host)) return "youtube";
  if (SPOTIFY_HOSTS.has(host)) return "spotify";
  if (DEEZER_HOSTS.has(host)) return "deezer";
  return null;
}

/** Human-readable provider name for UI labels. */
export function providerLabel(provider: ProviderName): string {
  if (provider === "spotify") return "Spotify";
  if (provider === "deezer") return "Deezer";
  return "YouTube";
}
