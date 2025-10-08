import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const requestUrl = new URL(request.url);
    const isLocalNetwork = requestUrl.hostname.includes("192.168.");

    // Busca o token do cookie - prioriza o correto para o ambiente
    let token = cookieStore.get("accessToken")?.value;

    // Fallback para desenvolvimento em rede local
    // if (!token && isLocalNetwork) {
    //   token = cookieStore.get("accessToken_localhost")?.value;
    // }

    console.log("Token encontrado:", token ? "Sim" : "Não");

    if (!token) {
      return NextResponse.json(
        {
          authorized: false,
          error: "Token não encontrado",
        },
        { status: 401 }
      );
    }

    // Verificação básica do formato JWT
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      return NextResponse.json(
        { authorized: false, error: "Formato de token inválido" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authorized: true,
      message: "Autorizado com sucesso",
    });
  } catch (error) {
    console.error("Erro na autorização WebSocket:", error);
    return NextResponse.json(
      { authorized: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
