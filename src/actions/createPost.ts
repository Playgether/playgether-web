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

function toApiMedia(media: PostMediaProps) {
  return {
    media_file: media.media_file,
    media_type: media.media_type,
    width: media.width,
    height: media.height,
    bytes_file: media.bytes_file,
    file_format: media.file_format,
  };
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

    const medias = (data.medias ?? [])
      .filter((m) => Boolean(m?.media_file))
      .map(toApiMedia);

    const payload = {
      comment: data.comment ?? "",
      has_post_media: medias.length > 0,
      medias,
    };

    const response = await api.post("/api/v1/posts/", payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error: any) {
    const errorBody = error.response?.data;
    console.error("Error creating post:", errorBody ?? error);
    return {
      status: error.response?.status || 500,
      error: errorBody || "Failed to create post",
    };
  }
}
