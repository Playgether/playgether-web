import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../utils/handleApiError";

export async function GET(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  try {
    const response = await api.get("/api/v1/reposts/", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { username },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error, "Error fetching profile reposts");
  }
}
