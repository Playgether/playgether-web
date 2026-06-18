import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function POST(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await api.post("/api/v1/reports/", body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const detail = error.response?.data?.detail ?? error.response?.data ?? "Erro ao criar denúncia";
    return NextResponse.json({ detail }, { status });
  }
}

export async function GET(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  try {
    const response = await api.get("/api/v1/reports/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const detail = error.response?.data?.detail ?? "Erro ao buscar denúncias";
    return NextResponse.json({ detail }, { status });
  }
}
