import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  const axiosResp = await api.delete(`api/v1/sessions/${sessionId}/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    validateStatus: () => true,
    responseType: "text",
  });

  const text = axiosResp.data ?? "";
  const json = (() => {
    try { return JSON.parse(text); }
    catch { return { detail: text }; }
  })();

  return NextResponse.json(json, { status: axiosResp.status });
}
