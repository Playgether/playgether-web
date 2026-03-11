import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pk: string }> }
) {
  try {
    const accessToken = (await cookies()).get("accessToken")?.value;
    const { pk } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const pageSize = searchParams.get("page_size") ?? "10";

    const apiParams: Record<string, string> = { page_size: pageSize };
    if (cursor) apiParams.cursor = cursor;

    const response = await api.get(`/api/v1/profiles/${pk}/milestones/`, {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {},
      params: apiParams,
    });

    const data = response.data;
    return NextResponse.json({
      data: data.results ?? data,
      next_page: data.next ?? null,
      previous_page: data.previous ?? null,
    });
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const errData = error.response?.data;
    return NextResponse.json(
      errData ?? { error: "Erro ao carregar milestones" },
      { status }
    );
  }
}
