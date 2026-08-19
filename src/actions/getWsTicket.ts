"use server";

import { ensureAccessTokenCookie } from "@/lib/server/authTokens";

/**
 * Exchanges the current access token for a short-lived, one-time WS ticket.
 * The ticket (opaque UUID) is stored server-side (cache/Redis) with a 120s TTL
 * and is consumed on the first WS handshake, so the JWT never appears in a URL.
 */
export async function getWsTicket(): Promise<string | null> {
  const accessToken = await ensureAccessTokenCookie();
  if (!accessToken) return null;

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

  try {
    const res = await fetch(`${apiUrl}/api/v1/ws/ticket/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.ticket === "string" ? data.ticket : null;
  } catch {
    return null;
  }
}
