import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../../../../utils/handleApiError";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { id } = await params;
  try {
    const res = await api.post(`/api/v1/dm/conversations/${id}/accept/`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(res.data);
  } catch (error) {
    return handleApiError(error, "Error accepting message request");
  }
}
