import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ profileId: string }> },
) {
  // Mantemos o parâmetro para compatibilidade, mas o endpoint unificado usa `request.user`.
  const { profileId } = await params;
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const axiosResp = await api.get(
    `/api/games/profiles/steam/status/${profileId}/`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      validateStatus: () => true,
      responseType: "text",
      // cache: no-store (server-side). axios doesn't cache by default.
    }
  );

  const text = axiosResp.data ?? "";
  const json = (() => {
    try {
      return JSON.parse(text);
    } catch {
      return { detail: text };
    }
  })();

  // Esperado: { platforms: { steam: { connected, nickname, avatar, steam_profile_public } } }
  const steam = json?.platforms?.steam ?? json;
  return NextResponse.json(steam, { status: axiosResp.status });
}

