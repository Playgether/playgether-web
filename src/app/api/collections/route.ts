import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../utils/handleApiError";

async function getToken() {
  return (await cookies()).get("accessToken")?.value;
}

export async function GET() {
  const accessToken = await getToken();
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });

  try {
    const response = await api.get("/api/v1/users/collections/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error, "Error fetching collections");
  }
}

export async function POST(request: NextRequest) {
  const accessToken = await getToken();
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const response = await api.post("/api/v1/users/collections/", body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/collections]", error?.response?.status, JSON.stringify(error?.response?.data ?? error?.message));
    return handleApiError(error, "Error creating collection");
  }
}
