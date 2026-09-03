import { NextResponse } from "next/server";
import { api } from "@/services/api";
import { ensureSessionAuth } from "@/lib/server/authTokens";

export async function GET() {
  const session = await ensureSessionAuth();
  if (!session) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  try {
    const response = await api.get(
      `/api/v1/users/${session.userId}/notifications/`,
      {
        headers: { Authorization: `Bearer ${session.access}` },
      },
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    return NextResponse.json({ detail: "Erro ao buscar notificações" }, { status });
  }
}

export async function DELETE() {
  const session = await ensureSessionAuth();
  if (!session) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  try {
    await api.delete(`/api/v1/users/${session.userId}/notifications/clear_all/`, {
      headers: { Authorization: `Bearer ${session.access}` },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    return NextResponse.json({ detail: "Erro ao excluir notificações" }, { status });
  }
}

export async function PATCH() {
  const session = await ensureSessionAuth();
  if (!session) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  try {
    await api.patch(
      `/api/v1/users/${session.userId}/notifications/read_all/`,
      {},
      {
        headers: { Authorization: `Bearer ${session.access}` },
      },
    );
    return NextResponse.json({ detail: "Todas marcadas como lidas." });
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    return NextResponse.json({ detail: "Erro ao marcar notificações" }, { status });
  }
}
