import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../../utils/handleApiError";

async function getToken() {
  return (await cookies()).get("accessToken")?.value;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = await getToken();
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const pageSize = searchParams.get("page_size") ?? "12";

  try {
    const reqParams: Record<string, string> = { page_size: pageSize };
    if (cursor) reqParams.cursor = cursor;
    const response = await api.get(`/api/v1/users/collections/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: reqParams,
    });
    return NextResponse.json({
      data: response.data.results ?? [],
      next_page: response.data.next ?? null,
    });
  } catch (error) {
    return handleApiError(error, "Error fetching collection");
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = await getToken();
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    await api.delete(`/api/v1/users/collections/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, "Error deleting collection");
  }
}
