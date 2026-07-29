import { PostCommentsApiReturn } from "./getComments";
import { api } from "./api";
import { optionalAuthHeaders } from "@/lib/optionalAuthHeaders";

export const getCommentsServer = async (
  postId: number | string | undefined,
  pageParam: string | null = null,
  type: "posts" | "comments" | "profiles" | "reposts" = "posts",
) => {
  try {
    const headers = await optionalAuthHeaders();
    const response = await api.get<PostCommentsApiReturn>(
      `/api/v1/${type}/${postId}/comments/`,
      {
        ...(headers ? { headers } : {}),
        params: {
          cursor: pageParam,
        },
      },
    );
    return {
      data: response.data.results,
      next_page: response.data.next,
      previous_page: response.data.previous,
    };
  } catch (error) {
    console.log(error);
    return {
      data: [],
      next_page: null,
      previous_page: null,
    };
  }
};
