import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";

/**
 * GET /api/terms/active/[documentType]
 * Retorna o documento legal ativo para o tipo (terms, privacy, community, cookies).
 * Público - não requer autenticação.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ documentType: string }> }
) {
  const { documentType } = await params;
  try {
    const response = await api.get(`/api/v1/terms/active/${documentType}/`);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { status: number; data?: unknown } };
    if (err.response?.status === 404) {
      return NextResponse.json(
        { detail: `No active document for type '${documentType}'.` },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Error fetching document" },
      { status: 500 }
    );
  }
}
