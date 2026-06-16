import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await api.post("/api/v1/auth/forgot-password/", body);
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const data = error.response?.data ?? { detail: "Erro interno." };
    return NextResponse.json(data, { status });
  }
}
