import { apiFetch } from "@/services/apiFetch";

export interface SearchUser {
  username: string;
  name: string;
  profile_photo: string | null;
  verified: boolean;
}

export interface SearchGame {
  id: number;
  name: string;
  acronym: string;
  icon: string | null;
}

export interface SearchRoom {
  id: number;
  slug: string;
  group_name: string;
  banner: string | null;
  summary: string;
  peak_users: number;
}

export interface SearchPost {
  id: string;
  comment: string;
  username: string;
  name: string;
  profile_photo: string | null;
  timestamp: string;
  has_post_media: boolean;
  quantity_likes: number;
  quantity_comment: number;
  quantity_reposts: number;
}

export interface GlobalSearchResults {
  users: SearchUser[];
  games: SearchGame[];
  rooms: SearchRoom[];
  posts: SearchPost[];
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  type?: "all" | "users" | "posts" | "rooms" | "games";
  has_media?: boolean;
}

export async function searchGlobal(q: string, options: SearchOptions = {}): Promise<GlobalSearchResults> {
  const params = new URLSearchParams({ q });
  if (options.limit !== undefined) params.set("limit", String(options.limit));
  if (options.offset !== undefined) params.set("offset", String(options.offset));
  if (options.type) params.set("type", options.type);
  if (options.has_media) params.set("has_media", "true");

  const resp = await apiFetch(`/api/search/?${params}`, { method: "GET" });

  if (!resp.ok) {
    return { users: [], games: [], rooms: [], posts: [] };
  }

  return resp.json() as Promise<GlobalSearchResults>;
}

const RECENT_SEARCHES_KEY = "playgether_recent_searches";
const MAX_RECENT = 8;

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  try {
    const trimmed = query.trim();
    if (!trimmed) return;
    const current = getRecentSearches().filter((s) => s !== trimmed);
    const updated = [trimmed, ...current].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function removeRecentSearch(query: string): void {
  try {
    const updated = getRecentSearches().filter((s) => s !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}
