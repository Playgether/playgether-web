import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Milestone ID is required" }, { status: 400 });
  }

  try {
    const response = await api.get(`/api/v1/milestones/${id}/`, {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const data = error.response?.data;
    return NextResponse.json(data ?? { error: "Erro ao carregar milestone" }, {
      status,
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { id } = await params;

  if (!accessToken) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ error: "Milestone ID is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const response = await api.patch(`/api/v1/milestones/${id}/`, body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const data = error.response?.data;
    return NextResponse.json(
      data ?? { error: "Erro ao atualizar milestone" },
      { status }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { id } = await params;

  if (!accessToken) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ error: "Milestone ID is required" }, { status: 400 });
  }

  try {
    await api.delete(`/api/v1/milestones/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const data = error.response?.data;
    return NextResponse.json(
      data ?? { error: "Erro ao excluir milestone" },
      { status }
    );
  }
}
