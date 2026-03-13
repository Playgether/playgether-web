import { NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";

/**
 * GET /api/terms/pending
 * Retorna os documentos legais ativos que o usuário ainda não aceitou.
 * Requer autenticação.
 */
export async function GET() {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json(
      { detail: "Authentication required." },
      { status: 401 }
    );
  }

  try {
    const response = await api.get("/api/v1/terms/pending/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { status: number; data?: unknown } };
    const status = err.response?.status ?? 500;
    const data = err.response?.data ?? {};
    return NextResponse.json(data, { status });
  }
}
