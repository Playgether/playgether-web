import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ gameSlug: string }> }
) {
  const { gameSlug } = await params;
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.baseUrl) {
    return NextResponse.json({ detail: "Missing baseUrl" }, { status: 500 });
  }

  const axiosResp = await api.get(`/api/v1/duo/stats/${encodeURIComponent(gameSlug)}/`, {
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
