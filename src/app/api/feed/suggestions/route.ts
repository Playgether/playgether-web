import { NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../../utils/handleApiError";

export async function GET() {
  const accessToken = (await cookies()).get("accessToken")?.value;

  try {
    const response = await api.get(`/api/v1/feed/suggestions/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error, "Error fetching feed suggestions");
  }
}
