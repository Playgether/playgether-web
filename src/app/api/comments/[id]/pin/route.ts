import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });

  const { id } = await context.params;
  try {
    const response = await api.post(`/api/v1/comments/${id}/pin/`, null, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const detail = error.response?.data?.detail ?? "Erro ao fixar comentário";
    return NextResponse.json({ detail }, { status });
  }
}
