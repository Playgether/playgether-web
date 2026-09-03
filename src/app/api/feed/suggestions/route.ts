import { NextResponse } from "next/server";
import { api } from "@/services/api";
import { handleApiError } from "../../utils/handleApiError";
import { ensureAccessTokenCookie } from "@/lib/server/authTokens";

export async function GET() {
  const accessToken = await ensureAccessTokenCookie();
  if (!accessToken) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

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
