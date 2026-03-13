// app/api/comments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../utils/handleApiError";

export async function POST(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;

  try {
    const data = await request.json();
    const response = await api.post("/api/v1/comments/", data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error, "Error while posting the comment");
  }
}
