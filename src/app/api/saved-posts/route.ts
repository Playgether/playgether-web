import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../utils/handleApiError";

async function getToken() {
  return (await cookies()).get("accessToken")?.value;
}

export async function GET(request: NextRequest) {
  const accessToken = await getToken();
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const pageSize = searchParams.get("page_size") ?? "10";

  try {
    const params: Record<string, string> = { page_size: pageSize };
    if (cursor) params.cursor = cursor;
    const response = await api.get("/api/v1/users/saved-posts/", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });
    return NextResponse.json({
      data: response.data.results ?? [],
      next_page: response.data.next ?? null,
    });
  } catch (error) {
    return handleApiError(error, "Error fetching saved posts");
  }
}

export async function POST(request: NextRequest) {
  const accessToken = await getToken();
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const response = await api.post("/api/v1/users/saved-posts/", body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return handleApiError(error, "Error saving post");
  }
}

export async function DELETE(request: NextRequest) {
  const accessToken = await getToken();
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const response = await api.delete("/api/v1/users/saved-posts/", {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: body,
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, "Error unsaving post");
  }
}
