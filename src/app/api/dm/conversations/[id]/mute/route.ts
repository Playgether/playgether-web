import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../../../../utils/handleApiError";

async function handler(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  method: "post" | "delete"
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { id } = await params;
  try {
    const res = await api[method](
      `/api/v1/dm/conversations/${id}/mute/`,
      method === "post" ? {} : undefined,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return NextResponse.json(res.data ?? { ok: true }, { status: res.status });
  } catch (error) {
    return handleApiError(error, "Error updating mute status");
  }
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return handler(request, ctx, "post");
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return handler(request, ctx, "delete");
}
