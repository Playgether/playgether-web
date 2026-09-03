import { NextResponse } from "next/server";
import { api } from "@/services/api";
import { ensureSessionAuth } from "@/lib/server/authTokens";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await ensureSessionAuth();
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  try {
    await api.patch(
      `/api/v1/users/${session.userId}/notifications/${id}/read/`,
      {},
      {
        headers: { Authorization: `Bearer ${session.access}` },
      },
    );
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
  const session = await ensureSessionAuth();
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  try {
    await api.delete(
      `/api/v1/users/${session.userId}/notifications/${id}/delete/`,
      {
        headers: { Authorization: `Bearer ${session.access}` },
      },
    );
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    return NextResponse.json({ detail: "Erro ao excluir notificação" }, { status });
  }
}
