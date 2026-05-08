import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function POST(
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

    const response = await api.post(`/api/v1/profiles/${pk}/follow/`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const detail =
      error.response?.data?.detail ??
      error.response?.data?.message ??
      "Erro ao seguir perfil";
    return NextResponse.json({ detail }, { status });
  }
}
