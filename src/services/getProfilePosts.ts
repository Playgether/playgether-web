import type { PostProps } from "@/app/feed/types/PostProps";

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
    const url = new URL("/api/profile-posts", window.location.origin);
    url.searchParams.set("username", username);
    url.searchParams.set("has_post_media", String(hasPostMedia));
    url.searchParams.set("page_size", String(pageSize));
    if (cursor) url.searchParams.set("cursor", cursor);
    if (filters?.search?.trim())
      url.searchParams.set("search", filters.search.trim());
    if (filters?.timestampStart)
      url.searchParams.set("timestamp_start", filters.timestampStart);
    if (filters?.timestampEnd)
      url.searchParams.set("timestamp_end", filters.timestampEnd);

    const response = await fetch(url.toString(), { credentials: "include" });

    if (!response.ok) throw new Error("Request failed");
    return await response.json();
  } catch (error) {
    console.error("Error fetching profile posts:", error);
    return { data: [], next_page: null };
  }
}
