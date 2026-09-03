import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../../../utils/handleApiError";

export async function POST(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const body = await request.json();
  try {
    const res = await api.post("/api/v1/dm/conversations/create_group/", body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    return handleApiError(error, "Error creating group");
  }
}
