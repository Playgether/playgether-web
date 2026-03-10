import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const hasPostMedia = searchParams.get("has_post_media");
  const cursor = searchParams.get("cursor");
  const pageSize = searchParams.get("page_size");
  const search = searchParams.get("search");
  const timestampStart = searchParams.get("timestamp_start");
  const timestampEnd = searchParams.get("timestamp_end");

  if (!username || hasPostMedia === null || hasPostMedia === undefined) {
    return NextResponse.json(
      { error: "username and has_post_media are required" },
      { status: 400 }
    );
  }

  try {
    const params: Record<string, string> = {
      created_by_user__username: username,
      has_post_media: hasPostMedia,
    };
    if (cursor) params.cursor = cursor;
    if (pageSize) params.page_size = pageSize;
    if (search?.trim()) params.search = search.trim();
    if (timestampStart) params.timestamp_start = timestampStart;
    if (timestampEnd) params.timestamp_end = timestampEnd;

    const response = await api.get("/api/v1/posts/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });

    return NextResponse.json({
      data: response.data.results ?? [],
      next_page: response.data.next ?? null,
      previous_page: response.data.previous ?? null,
    });
  } catch (error) {
    console.error("Error fetching profile posts:", error);
    return NextResponse.json(
      { error: "Error fetching profile posts" },
      { status: 500 }
    );
  }
}
