import { PostsCommentsProps } from "./getComments";

export interface ProfileCommentsResponse {
  data: PostsCommentsProps[];
  next_page: string | null;
  previous_page?: string | null;
}

export async function getProfileCommentsClient(
  profilePk: string | number,
  cursor: string | null = null
): Promise<ProfileCommentsResponse> {
  try {
    const url = new URL(`/api/profiles/${profilePk}/comments`, window.location.origin);
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url.toString(), { credentials: "include" });

    if (!response.ok) throw new Error("Request failed");
    return await response.json();
  } catch (error) {
    console.error("Error fetching profile comments:", error);
    return { data: [], next_page: null };
  }
}
