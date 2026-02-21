"use server";

import { api } from "@/services/api";
import { cookies } from "next/headers";

export const updateCommentAction = async (data: {
  content_type: string;
  comment: string;
  object_id: number;
  comment_id?: number;
}) => {
  const accessToken = (await cookies()).get("accessToken")?.value;
  try {
    const response = await api.patch(
      `/api/v1/comments/${data.comment_id}/`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
