import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";

/**
 * POST /api/terms/accept
 * Aceita os documentos legais. Body: { document_ids: [1, 2, 3] }
 * Requer autenticação (cookie accessToken).
 */
export async function POST(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json(
      { detail: "Authentication required." },
      { status: 401 }
    );
  }

  let body: { document_ids?: number[] } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const userAgent = request.headers.get("user-agent") ?? undefined;
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const rawIp = forwardedFor?.split(",")[0]?.trim() ?? realIp ?? undefined;
  const isLocalhost = rawIp === "::1" || rawIp === "127.0.0.1";
  const clientIp = rawIp && !isLocalhost ? rawIp : undefined;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };
  if (userAgent) headers["X-Client-User-Agent"] = userAgent;
  if (clientIp) headers["X-Forwarded-For"] = clientIp;

  try {
    const response = await api.post(
      "/api/v1/terms/accept/",
      { document_ids: body.document_ids ?? [] },
      {
        headers,
      }
    );
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { status: number; data?: { detail?: string } } };
    const status = err.response?.status ?? 500;
    const data = err.response?.data ?? {};
    return NextResponse.json(data, { status });
  }
}
