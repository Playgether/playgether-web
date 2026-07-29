import { api } from "@/services/api";
import { ensureAccessTokenCookie } from "@/actions/refreshToken";

export async function getFeedServer(pageParam: string | null = null) {
  const accessToken = await ensureAccessTokenCookie();
  if (!accessToken) {
    return {
      data: [],
      next_page: null,
    };
  }

  try {
    const response = await api.get(`/api/v1/feed/`, {
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
