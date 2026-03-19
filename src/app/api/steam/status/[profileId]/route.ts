import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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

  const baseUrl = process.env.baseUrl;
  if (!baseUrl) {
    return NextResponse.json({ detail: "Missing baseUrl" }, { status: 500 });
  }

  const resp = await fetch(
    `${baseUrl}/api/games/profiles/steam/status/${profileId}/`,
    {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    }
  );

  const text = await resp.text();
  const json = (() => {
    try {
      return JSON.parse(text);
    } catch {
      return { detail: text };
    }
  })();

  // Esperado: { platforms: { steam: { connected, nickname, avatar, steam_profile_public } } }
  const steam = json?.platforms?.steam ?? json;
  return NextResponse.json(steam, { status: resp.status });
}

