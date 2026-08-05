import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";
import { handleApiError } from "../../../utils/handleApiError";

async function getToken() {
  return (await cookies()).get("accessToken")?.value;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = await getToken();
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    const response = await api.post(`/api/v1/cuts/${id}/likes/`, null, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return handleApiError(error, "Error liking cut");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = await getToken();
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    await api.delete(`/api/v1/cuts/${id}/likes/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, "Error unliking cut");
  }
}
