import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function GET() {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const userId = jar.get("user_id")?.value;

  if (!accessToken || !userId) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  try {
    const response = await api.get(`/api/v1/users/${userId}/notifications/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    return NextResponse.json({ detail: "Erro ao buscar notificações" }, { status });
  }
}

export async function DELETE() {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const userId = jar.get("user_id")?.value;

  if (!accessToken || !userId) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  try {
    await api.delete(`/api/v1/users/${userId}/notifications/clear_all/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    return NextResponse.json({ detail: "Erro ao excluir notificações" }, { status });
  }
}

export async function PATCH() {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const userId = jar.get("user_id")?.value;

  if (!accessToken || !userId) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  try {
    await api.patch(`/api/v1/users/${userId}/notifications/read_all/`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json({ detail: "Todas marcadas como lidas." });
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    return NextResponse.json({ detail: "Erro ao marcar notificações" }, { status });
  }
}
