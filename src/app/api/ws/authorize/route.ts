import { NextRequest, NextResponse } from "next/server";
import { ensureAccessTokenCookie } from "@/actions/refreshToken";

export async function GET(_request: NextRequest) {
  try {
    const token = await ensureAccessTokenCookie();

    if (!token) {
      return NextResponse.json(
        {
          authorized: false,
          error: "Token não encontrado",
        },
        { status: 401 },
      );
    }

    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      return NextResponse.json(
        { authorized: false, error: "Formato de token inválido" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      authorized: true,
      message: "Autorizado com sucesso",
      token,
    });
  } catch (error) {
    console.error("Erro na autorização WebSocket:", error);
    return NextResponse.json(
      { authorized: false, error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
