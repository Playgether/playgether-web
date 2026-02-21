"use server";

import { api } from "@/services/api";
import { cookies } from "next/headers";

export interface PostMediaProps {
  media_file: string;
  media_type: string;
  width: number;
  height: number;
  bytes_file: number;
  file_format: string;
  created_at: string;
  media_folder: string;
  url?: string;
}

export async function createPost(data: {
  comment: string;
  has_post_media: boolean;
  medias: PostMediaProps[];
}) {
  try {
    const accessToken = (await cookies()).get("accessToken")?.value;
    const userId = (await cookies()).get("user_id")?.value;

    if (!accessToken || !userId) {
      return {
        status: 401,
        error: "Unauthorized",
      };
    }

    const response = await api.post(
      "/api/v1/posts/",
      {
        comment: data.comment,
        created_by_user: parseInt(userId),
        has_post_media: data.has_post_media,
        medias: data.medias,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error: any) {
    console.error("Error creating post:", error);
    return {
      status: error.response?.status || 500,
      error: error.response?.data || "Failed to create post",
    };
  }
}
