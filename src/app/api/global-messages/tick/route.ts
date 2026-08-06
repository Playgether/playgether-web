import { NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";
import { handleApiError } from "../../utils/handleApiError";

export async function POST() {
  const accessToken = (await cookies()).get("accessToken")?.value;
  try {
    const res = await api.post(
      "/api/v1/global-messages/tick/",
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return NextResponse.json(res.data);
  } catch (error) {
    return handleApiError(error, "Error ticking global messages");
  }
}
