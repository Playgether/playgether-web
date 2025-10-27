// app/api/comments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const { id } = await params;

  try {
    const response = await api.get(`/api/v1/posts/${id}/comments/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: { cursor },
    });

    return NextResponse.json({
      data: response.data.results,
      next_page: response.data.next,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Error fetching comments" },
      { status: 500 }
    );
  }
}
