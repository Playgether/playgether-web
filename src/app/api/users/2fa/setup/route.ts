import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

async function getToken() {
  return (await cookies()).get("accessToken")?.value;
}

export async function GET() {
  const accessToken = await getToken();
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  try {
    const res = await api.get("/api/v1/users/2fa/setup/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ detail: err.response?.data?.detail ?? "Erro" }, { status: err.response?.status ?? 500 });
  }
}

export async function POST() {
  const accessToken = await getToken();
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  try {
    const res = await api.post("/api/v1/users/2fa/setup/", {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ detail: err.response?.data?.detail ?? "Erro" }, { status: err.response?.status ?? 500 });
  }
}
