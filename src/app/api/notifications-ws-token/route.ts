import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Returns the access token for WebSocket authentication.
 * Called by the client with credentials so the cookie is sent.
 * This avoids passing the JWT from server components to client components as a prop.
 */
export async function GET() {
  const accessToken = (await cookies()).get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ token: null }, { status: 401 });
  }

  return NextResponse.json({ token: accessToken });
}
