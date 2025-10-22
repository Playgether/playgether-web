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
  quantity_replies: number;
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

export async function getCommentsClient(
  id: number,
  pageParam: string | null = null
) {
  try {
    const response = await fetch(
      `/api/comments/${id}?cursor=${pageParam || ""}`
    );

    if (!response.ok) throw new Error("Request failed");
    return await response.json();
  } catch (error) {
    console.error("Error fetching comments:", error);
    return {
      data: [],
      next_page: null,
    };
  }
}
