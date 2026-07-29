import { apiFetch } from "@/services/apiFetch";
import type { FeedMode } from "../types/FeedMode";
import { parseFeedCursor } from "../utils/parseFeedCursor";

export { parseFeedCursor };

export async function getFeedClient(
  pageParam: string | null = null,
  mode: FeedMode = "following",
) {
  const params = new URLSearchParams();
  if (pageParam) params.set("cursor", pageParam);
  if (mode !== "following") params.set("mode", mode);

  const response = await apiFetch(`/api/feed?${params.toString()}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Feed request failed: ${response.status}`);
  }

  return response.json();
}
