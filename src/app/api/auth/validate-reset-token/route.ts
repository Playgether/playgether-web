import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  try {
    const response = await api.get("/api/v1/auth/validate-reset-token/", {
      params: { token },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const data = error.response?.data ?? { valid: false };
    return NextResponse.json(data, { status });
  }
}
