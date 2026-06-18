import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ pk: string }> },
  method: "post" | "delete"
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }
  const { pk } = await params;
  try {
    const response = await api[method](`/api/v1/profiles/${pk}/block/`, method === "post" ? {} : undefined, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const detail = error.response?.data?.detail ?? "Erro ao processar ação de bloqueio";
    return NextResponse.json({ detail }, { status });
  }
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ pk: string }> }) {
  return handler(request, ctx, "post");
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ pk: string }> }) {
  return handler(request, ctx, "delete");
}
