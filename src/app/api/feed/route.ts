import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");

  try {
    const response = await api.get(`/api/v1/feed/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        cursor,
      },
    });

    return NextResponse.json({
      data: response.data.results,
      next_page: response.data.next,
    });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching feed" }, { status: 500 });
  }
}
