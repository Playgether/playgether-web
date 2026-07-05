import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../utils/handleApiError";

export async function GET(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const pageSize = searchParams.get("page_size") ?? "10";

  try {
    const params: Record<string, string> = { page_size: pageSize };
    if (cursor) params.cursor = cursor;

    const response = await api.get("/api/v1/users/liked-posts/", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });

    return NextResponse.json({
      data: response.data.results ?? [],
      next_page: response.data.next ?? null,
    });
  } catch (error) {
    return handleApiError(error, "Error fetching liked posts");
  }
}
