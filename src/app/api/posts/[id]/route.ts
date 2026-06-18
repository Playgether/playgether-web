import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { id } = await params;

  try {
    const response = await api.get(`/api/v1/posts/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error?.response?.status ?? 500;
    const data = error?.response?.data;
    return NextResponse.json(data ?? { error: "Post não encontrado" }, { status });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  try {
    const body = await request.json();
    const response = await api.patch(`/api/v1/posts/${id}/`, body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error?.response?.status ?? 500;
    const data = error?.response?.data;
    return NextResponse.json(data ?? { error: "Erro ao atualizar post" }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  try {
    await api.delete(`/api/v1/posts/${id}/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting post:", error);
    const status = error?.response?.status ?? 500;
    const data = error?.response?.data;
    return NextResponse.json(
      data ?? { error: "Erro ao excluir post" },
      { status }
    );
  }
}
