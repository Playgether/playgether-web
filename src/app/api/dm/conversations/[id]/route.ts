import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../../../utils/handleApiError";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { id } = await params;
  try {
    await api.delete(`/api/v1/dm/conversations/${id}/delete/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "Error deleting conversation");
  }
}
