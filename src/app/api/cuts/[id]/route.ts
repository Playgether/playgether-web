import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";
import { handleApiError } from "../../utils/handleApiError";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Cut ID is required" }, { status: 400 });
  }

  try {
    await api.delete(`/api/v1/cuts/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, "Error deleting cut");
  }
}
