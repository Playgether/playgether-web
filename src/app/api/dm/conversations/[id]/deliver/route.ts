import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../../../../utils/handleApiError";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { id } = await params;
  try {
    const body = await request.json().catch(() => ({}));
    const res = await api.post(
      `/api/v1/dm/conversations/${id}/deliver/`,
      body,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return NextResponse.json(res.data);
  } catch (error) {
    return handleApiError(error, "Error marking messages as delivered");
  }
}
