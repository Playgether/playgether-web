import type { FeedMode } from "../types/FeedMode";
import { parseFeedCursor } from "../utils/parseFeedCursor";

export { parseFeedCursor };

export async function getFeedClient(
  pageParam: string | null = null,
  mode: FeedMode = "following",
) {
  try {
    const params = new URLSearchParams();
    if (pageParam) params.set("cursor", pageParam);
    if (mode !== "following") params.set("mode", mode);
    const response = await fetch(`/api/feed?${params.toString()}`);
    if (!response.ok) throw new Error("Request failed");
    return await response.json();
  } catch (error) {
    console.error("Error fetching feed:", error);
    return {
      data: [],
      next_page: null,
    };
  }
}
