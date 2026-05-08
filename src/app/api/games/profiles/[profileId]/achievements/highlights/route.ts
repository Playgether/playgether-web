import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ profileId: string }> },
) {
  const { profileId } = await params;
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.baseUrl;
  if (!baseUrl) {
    return NextResponse.json({ detail: "Missing baseUrl" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  const axiosResp = await api.put(
    `/api/games/profiles/${profileId}/achievements/highlights/`,
    body,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      validateStatus: () => true,
      responseType: "text",
    },
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
