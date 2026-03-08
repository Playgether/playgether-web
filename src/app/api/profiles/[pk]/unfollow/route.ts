import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ pk: string }> }
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }
  try {
    const { pk } = await params;
    await api.post(`/api/v1/profiles/${pk}/unfollow/`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json({ detail: "ok" });
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const detail = error.response?.data?.detail ?? "Erro ao deixar de seguir";
    return NextResponse.json({ detail }, { status });
  }
}
