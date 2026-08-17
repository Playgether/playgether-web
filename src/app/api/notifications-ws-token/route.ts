import { NextResponse } from "next/server";

/**
 * Legacy endpoint kept temporarily so stale clients fail without receiving
 * the session access token. WebSocket clients must use /api/ws/authorize.
 */
export async function GET() {
  return NextResponse.json(
    {
      detail: "Use /api/ws/authorize with a scoped WebSocket path.",
    },
    {
      status: 410,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
