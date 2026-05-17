import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

/**
 * POST /api/media/resolve
 * Body: { url: string }  (HTTPS YouTube URL)
 *
 * Proxies to Django POST /api/v1/media/resolve/ with the session Bearer token.
 * Returns a MediaTrack object with provider data.
 */
export async function POST(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("url" in body)) {
    return NextResponse.json({ error: "Campo 'url' é obrigatório." }, { status: 400 });
  }

  try {
    const res = await api.post("/api/v1/media/resolve/", body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(res.data, { status: res.status });
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number; data?: unknown } };
    const upstream = axiosErr?.response;
    if (upstream?.status && upstream.status < 500) {
      return NextResponse.json(upstream.data ?? { error: "Erro na resolução." }, {
        status: upstream.status,
      });
    }
    return NextResponse.json(
      { error: "Erro ao resolver a mídia. Tente novamente." },
      { status: 502 },
    );
  }
}
