import type { PostProps } from "@/app/feed/types/PostProps";
import { apiFetch } from "@/services/apiFetch";

export interface ProfilePostsResponse {
  data: PostProps[];
  next_page: string | null;
  previous_page?: string | null;
}

export interface ProfilePostsFilters {
  search?: string | null;
  timestampStart?: string | null;
  timestampEnd?: string | null;
}

export async function getProfilePostsClient(
  username: string,
  hasPostMedia: boolean,
  cursor: string | null = null,
  pageSize: number = 10,
  filters?: ProfilePostsFilters
): Promise<ProfilePostsResponse> {
  try {
    const params = new URLSearchParams();
    params.set("username", username);
    params.set("has_post_media", String(hasPostMedia));
    params.set("page_size", String(pageSize));
    if (cursor) params.set("cursor", cursor);
    if (filters?.search?.trim()) params.set("search", filters.search.trim());
    if (filters?.timestampStart) params.set("timestamp_start", filters.timestampStart);
    if (filters?.timestampEnd) params.set("timestamp_end", filters.timestampEnd);

    const url = `/api/profile-posts?${params.toString()}`;
    const response = await apiFetch(url, { credentials: "include" });

    if (!response.ok) throw new Error("Request failed");
    return await response.json();
  } catch (error) {
    console.error("Error fetching profile posts:", error);
    return { data: [], next_page: null };
  }
}
