import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

/** Proxy para GET /api/v1/chatrooms/occupancy/ com Bearer do cookie (uso no cliente). */
export async function GET(request: Request) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({}, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");
  if (!ids?.trim()) {
    return NextResponse.json({});
  }
  try {
    const res = await api.get<Record<string, number>>(
      "/api/v1/chatrooms/occupancy/",
      {
        params: { ids },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return NextResponse.json(res.data ?? {});
  } catch {
    return NextResponse.json({});
  }
}
