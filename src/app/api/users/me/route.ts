import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export interface MeResponse {
  id: string;
  username: string;
  email_masked: string;
  has_usable_password: boolean;
  auth_provider: string;
  can_change_username: boolean;
  username_days_remaining: number;
  username_changed_at: string | null;
  totp_enabled: boolean;
}

export async function GET() {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });

  try {
    const response = await api.get("/api/v1/users/me/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data as MeResponse);
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const detail = error.response?.data?.detail ?? "Erro ao carregar dados do usuário";
    return NextResponse.json({ detail }, { status });
  }
}
