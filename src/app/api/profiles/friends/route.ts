import { NextResponse } from "next/server";
import { api } from "@/services/api";
import { ensureAccessTokenCookie } from "@/lib/server/authTokens";

export async function GET() {
  const accessToken = await ensureAccessTokenCookie();

  if (!accessToken) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  try {
    const response = await api.get("/api/v1/profiles/friends/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const detail =
      error.response?.data?.detail ??
      error.response?.data?.message ??
      "Erro ao listar amigos";
    return NextResponse.json({ detail }, { status });
  }
}
