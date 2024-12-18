import { api } from "./api";
import { PostCommentsApiReturn } from "./getComments";
import { TokenData } from "./updateTokenRequest";

export const getAnswers = async (
  authTokens: TokenData | undefined | null,
  commentId: number | undefined,
  pageParam: string | null = null
) => {
  try {
    const response = await api.get<PostCommentsApiReturn>(
      `/api/v1/comments/${commentId}/answers/`,
      {
        headers: {
          Authorization: "Bearer " + String(authTokens?.access),
        },
        params: {
          cursor: pageParam,
        },
      }
    );
    return {
      data: response.data.results,
      next_page: response.data.next,
      previous_page: response.data.previous
    };
  } catch (error) {
    console.log(error);
    return {
      data: [],
      next_page: null,
      previous_page:null,
    };
  }
};
