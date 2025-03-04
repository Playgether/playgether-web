import { cookies } from "next/headers";
import { api } from "./api";
import { TokenData } from "./updateTokenRequest";

export interface PostCommentsApiReturn {
  next: string;
  previous: string;
  results: PostsCommentsProps[];
}
export interface PostsCommentsProps {
  answers: PostCommentsApiReturn;
  id: number;
  created_by_user_name: string;
  created_by_user_photo: string;
  user_already_like: boolean;
  object_id: number;
  comment: string;
  timestamp: Date;
  quantity_comment: number;
  quantity_likes: number;
  content_type: string;
  user: number;
  edited: boolean;
}

export interface PostCommentsOfCommentsProps {
  id: number;
  created_by_user_name: string;
  created_by_user_photo: string;
  object_id: number;
  comment: string;
  timestamp: Date;
  quantity_comment: number;
  quantity_likes: number;
  content_type: string;
  user_already_like: boolean;
  user: number;
  answers: PostCommentsOfCommentsProps[];
  edited: boolean;
}

export const getComments = async (
  postId: number | undefined,
  pageParam: string | null = null
) => {
  // const accessToken = (await cookies()).get("accessToken")?.value;
  try {
    const response = await api.get<PostCommentsApiReturn>(
      `/api/v1/posts/${postId}/comments/`,
      {
        headers: {
          // Authorization: "Bearer " + String(accessToken),
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

// export function getComments (authTokens : TokenData | undefined | null, postId : number | undefined) {

//     let fetching =  api.get<PostsCommentsProps[]>(`/api/v1/posts/${postId}/comments/`, {
//         headers: {
//             'Authorization':'Bearer ' + String(authTokens?.access)
//         }}).then((response)=> {
//             status = "fulfilled";
//             result = response
//         }).catch((error)=> {
//             status = "rejected"
//             result = error
//         })

//     return () => {
//         if (status === "pending") {
//             throw fetching;
//         } else if (status === "rejected") {
//             throw result;
//         } else if (status === "fulfilled") {
//             return result
//         }
//     }
// };
