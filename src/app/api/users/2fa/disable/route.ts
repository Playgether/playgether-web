import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function POST(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  try {
    const body = await request.json();
    const res = await api.post("/api/v1/users/2fa/disable/", body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ detail: err.response?.data?.detail ?? "Erro" }, { status: err.response?.status ?? 500 });
  }
}
