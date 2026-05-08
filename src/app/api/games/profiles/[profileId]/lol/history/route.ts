import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const incomingUrl = new URL(request.url);
  const search = incomingUrl.searchParams.toString();
  const upstreamPath = search
    ? `/api/games/profiles/${profileId}/lol/history/?${search}`
    : `/api/games/profiles/${profileId}/lol/history/`;

  const axiosResp = await api.get(upstreamPath, {
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
