import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../../utils/handleApiError";

export async function GET(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q") ?? "";

  try {
    const response = await api.get("/api/v1/users/mention-suggestions/", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { q },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error, "Error fetching mention suggestions");
  }
}
