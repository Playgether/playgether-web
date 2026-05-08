import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pk: string }> }
) {
  const accessToken = (await cookies()).get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { detail: "Não autorizado" },
      { status: 401 }
    );
  }

  try {
    const { pk } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");

    const response = await api.get(`/api/v1/profiles/${pk}/comments/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: cursor ? { cursor } : {},
    });

    return NextResponse.json({
      data: response.data.results ?? response.data,
      next_page: response.data.next ?? null,
      previous_page: response.data.previous ?? null,
    });
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    return NextResponse.json(
      { error: "Erro ao carregar comentários" },
      { status }
    );
  }
}
