import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../../../../utils/handleApiError";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  try {
    const res = await api.get(`/api/v1/dm/conversations/${id}/messages/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: cursor ? { cursor } : {},
    });
    return NextResponse.json(res.data);
  } catch (error) {
    return handleApiError(error, "Error fetching messages");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { id } = await params;
  const body = await request.json();
  try {
    const res = await api.post(`/api/v1/dm/conversations/${id}/messages/`, body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(res.data);
  } catch (error) {
    return handleApiError(error, "Error sending message");
  }
}
