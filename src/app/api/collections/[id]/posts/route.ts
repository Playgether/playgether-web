import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../../../utils/handleApiError";

async function getToken() {
  return (await cookies()).get("accessToken")?.value;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = await getToken();
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const response = await api.post(`/api/v1/users/collections/${id}/posts/`, body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return handleApiError(error, "Error adding post to collection");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = await getToken();
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    await api.delete(`/api/v1/users/collections/${id}/posts/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: body,
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, "Error removing post from collection");
  }
}
