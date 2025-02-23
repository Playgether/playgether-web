"use server";

import { api } from "@/services/api";
import { cookies } from "next/headers";

export async function getFeed(pageParam: string | null = null) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const userId = (await cookies()).get("user_id")?.value;
  try {
    const response = await api.get(`/api/v1/posts/${userId}/feed/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        cursor: pageParam,
      },
    });
    return {
      data: response.data.results,
      next_page: response.data.next,
    };
  } catch (error) {
    console.error("Error fetching feed:", error);
    return {
      data: [],
      next_page: null,
    };
  }
}
