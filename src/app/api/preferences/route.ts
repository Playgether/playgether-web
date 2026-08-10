import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { ensureAccessTokenCookie } from "@/lib/server/authTokens";

export async function GET() {
  const accessToken = await ensureAccessTokenCookie();
  if (!accessToken) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  try {
    const response = await api.get("/api/v1/preferences/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    return NextResponse.json(
      { detail: error.response?.data?.detail ?? "Erro" },
      { status },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const accessToken = await ensureAccessTokenCookie();
  if (!accessToken) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await api.patch("/api/v1/preferences/", body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const data = error.response?.data ?? { detail: "Erro" };
    return NextResponse.json(data, { status });
  }
}
