import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function GET(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q") ?? "";

  try {
    const response = await api.get("/api/v1/search/", {
      params: { q },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const detail = error.response?.data?.detail ?? "Erro na busca";
    return NextResponse.json({ detail }, { status });
  }
}
