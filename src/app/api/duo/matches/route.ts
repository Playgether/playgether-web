import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function GET(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.baseUrl) {
    return NextResponse.json({ detail: "Missing baseUrl" }, { status: 500 });
  }

  const gameSlug = request.nextUrl.searchParams.get("game_slug");
  const path =
    gameSlug != null && gameSlug !== ""
      ? `/api/v1/duo/matches/?game_slug=${encodeURIComponent(gameSlug)}`
      : "/api/v1/duo/matches/";

  const axiosResp = await api.get(path, {
    headers: { Authorization: `Bearer ${accessToken}` },
    validateStatus: () => true,
    responseType: "text",
  });

  const text = axiosResp.data ?? "";
  const json = (() => {
    try {
      return JSON.parse(text);
    } catch {
      return { detail: text };
    }
  })();

  return NextResponse.json(json, { status: axiosResp.status });
}
