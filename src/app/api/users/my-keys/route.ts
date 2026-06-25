import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function GET() {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return NextResponse.json({}, { status: 401 });

  try {
    const response = await api.get("/api/v1/users/my-keys/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    return NextResponse.json(error.response?.data ?? {}, { status });
  }
}
