import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../../utils/handleApiError";

export async function GET(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const cursor = request.nextUrl.searchParams.get("cursor");
  try {
    const res = await api.get("/api/v1/global-messages/history/", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: cursor ? { cursor } : undefined,
    });
    return NextResponse.json(res.data);
  } catch (error) {
    return handleApiError(error, "Error fetching global messages history");
  }
}
