import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { handleApiError } from "../utils/handleApiError";
import { ensureAccessTokenCookie } from "@/actions/refreshToken";

export async function GET(request: NextRequest) {
  const accessToken = await ensureAccessTokenCookie();
  if (!accessToken) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const mode = searchParams.get("mode") || "following";

  try {
    const response = await api.get(`/api/v1/feed/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        cursor,
        mode,
      },
    });

    return NextResponse.json({
      data: response.data.results,
      next_page: response.data.next,
    });
  } catch (error) {
    return handleApiError(error, "Error fetching feed");
  }
}
