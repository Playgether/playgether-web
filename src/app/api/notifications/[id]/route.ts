import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const userId = jar.get("user_id")?.value;
  const { id } = await params;

  if (!accessToken || !userId) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  try {
    await api.patch(`/api/v1/users/${userId}/notifications/${id}/read/`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json({ detail: "Marcada como lida." });
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    return NextResponse.json({ detail: "Erro ao marcar notificação" }, { status });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const userId = jar.get("user_id")?.value;
  const { id } = await params;

  if (!accessToken || !userId) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  try {
    await api.delete(`/api/v1/users/${userId}/notifications/${id}/delete/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    return NextResponse.json({ detail: "Erro ao excluir notificação" }, { status });
  }
}
