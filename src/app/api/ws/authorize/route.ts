import { NextRequest, NextResponse } from "next/server";
import { ensureAccessTokenCookie } from "@/lib/server/authTokens";
import { api } from "@/services/api";

export async function GET(request: NextRequest) {
  try {
    const accessToken = await ensureAccessTokenCookie();

    if (!accessToken) {
      return NextResponse.json(
        {
          authorized: false,
          error: "Token não encontrado",
        },
        { status: 401 },
      );
    }

    const path = request.nextUrl.searchParams.get("path");
    if (!path?.startsWith("/ws/")) {
      return NextResponse.json(
        { authorized: false, error: "Caminho de WebSocket inválido" },
        { status: 400 },
      );
    }

    const response = await api.post(
      "/api/ws-ticket/",
      { path },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    return NextResponse.json({
      authorized: true,
      ticket: response.data.ticket,
      expires_in: response.data.expires_in,
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: any) {
    console.error("Erro na autorização WebSocket:", error);
    const status = error?.response?.status ?? 500;
    return NextResponse.json(
      { authorized: false, error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
