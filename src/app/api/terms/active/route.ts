import { NextResponse } from "next/server";
import { api } from "@/services/api";

/**
 * GET /api/terms/active
 * Retorna os termos de serviço atualmente ativos.
 * Público - não requer autenticação.
 */
export async function GET() {
  try {
    const response = await api.get("/api/v1/terms/active/");
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { status: number; data?: unknown } };
    if (err.response?.status === 404) {
      return NextResponse.json(
        { detail: "No active Terms of Service." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Error fetching terms" },
      { status: 500 }
    );
  }
}
