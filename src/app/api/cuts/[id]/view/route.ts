import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";
import { handleApiError } from "../../../utils/handleApiError";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { id } = await params;
  try {
    const response = await api.post(`/api/v1/cuts/${id}/view/`, null, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (response.status === 204) return new NextResponse(null, { status: 204 });
    return NextResponse.json(response.data ?? {}, { status: response.status });
  } catch (error) {
    return handleApiError(error, "Error registering cut view");
  }
}
