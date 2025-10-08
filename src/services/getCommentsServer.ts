import { cookies } from "next/headers";
import { PostCommentsApiReturn } from "./getComments";
import { api } from "./api";

export const getCommentsServer = async (
  postId: number | undefined,
  pageParam: string | null = null
) => {
  const accessToken = (await cookies()).get("accessToken")?.value;
  try {
    const response = await api.get<PostCommentsApiReturn>(
      `/api/v1/posts/${postId}/comments/`,
      {
        headers: {
          Authorization: "Bearer " + String(accessToken),
        },
        params: {
          cursor: pageParam,
        },
      }
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
