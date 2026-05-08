import { PostsCommentsProps } from "./getComments";
import { apiFetch } from "@/services/apiFetch";

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
    const url = `/api/profiles/${profilePk}/comments${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`;
    const response = await apiFetch(url, { credentials: "include" });

    if (!response.ok) throw new Error("Request failed");
    return await response.json();
  } catch (error) {
    console.error("Error fetching profile comments:", error);
    return { data: [], next_page: null };
  }
}
