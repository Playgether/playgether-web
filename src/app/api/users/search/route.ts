import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../../utils/handleApiError";

export async function GET(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("search") ?? "";

  try {
    const response = await api.get("/api/v1/users/", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { search: q },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error, "Error searching users");
  }
}
