import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";
import { handleApiError } from "../../../utils/handleApiError";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { id } = await params;
  try {
    const response = await api.get(`/api/v1/cuts/${id}/comments/`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error, "Error fetching cut comments");
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const response = await api.post(
      "/api/v1/comments/",
      { ...body, content_type: "cut", object_id: id },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return handleApiError(error, "Error commenting on cut");
  }
}
