import { NextResponse } from "next/server";
import { api } from "@/services/api";
import { handleApiError } from "../../utils/handleApiError";
import { ensureAccessTokenCookie } from "@/actions/refreshToken";

export async function GET() {
  const accessToken = await ensureAccessTokenCookie();
  if (!accessToken) {
    return NextResponse.json({ detail: "Não autorizado" }, { status: 401 });
  }

  try {
    const res = await api.get("/api/v1/dm/conversations/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(res.data);
  } catch (error) {
    return handleApiError(error, "Error fetching conversations");
  }
}
