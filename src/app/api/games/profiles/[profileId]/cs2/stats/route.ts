import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;
  const qs = new URL(request.url).searchParams.toString();
  const querySuffix = qs ? `?${qs}` : "";
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }


  const axiosResp = await api.get(
    `/api/games/profiles/${profileId}/cs2/stats/${querySuffix}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      validateStatus: () => true,
      responseType: "text",
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

  return NextResponse.json(json, { status: axiosResp.status });
}
