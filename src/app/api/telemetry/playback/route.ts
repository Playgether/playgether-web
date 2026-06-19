/**
 * POST /api/telemetry/playback
 * Receives a PlaybackTelemetryPayload from the frontend (via sendBeacon),
 * validates minimally, then forwards to Django POST /api/v1/media/telemetry/playback/.
 * Always returns 204 — telemetry must never fail visibly to the client.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

const ALLOWED_EVENT_TYPES = new Set([
  "IFRAME_LOAD_SUCCESS",
  "IFRAME_LOAD_FAILED",
  "AUTOPLAY_BLOCKED",
  "PLAYBACK_STARTED",
  "PLAYBACK_STALLED",
  "PLAYBACK_ABANDONED",
  "PROVIDER_SWITCHED_RUNTIME",
  "PLAYER_READY",
  "TIME_TO_FIRST_PLAY",
]);

const ALLOWED_PROVIDERS = new Set(["youtube", "spotify", "deezer"]);

export async function POST(request: NextRequest) {
  // Always respond 204 — caller uses sendBeacon and ignores the response
  const noContent = () => new NextResponse(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return noContent();
  }

  // Minimal validation — reject clearly malformed payloads before hitting Django
  if (
    typeof body.event_type !== "string" ||
    !ALLOWED_EVENT_TYPES.has(body.event_type) ||
    typeof body.provider !== "string" ||
    !ALLOWED_PROVIDERS.has(body.provider)
  ) {
    return noContent();
  }

  // Sanitize — user_id intentionally omitted; Django reads it from JWT
  const safe: Record<string, unknown> = {
    event_type: body.event_type,
    provider: body.provider,
    room_slug: typeof body.room_slug === "string" ? body.room_slug.slice(0, 80) : "",
    canonical_track_id: typeof body.canonical_track_id === "string" ? body.canonical_track_id.slice(0, 100) : "",
    time_ms: typeof body.time_ms === "number" ? Math.trunc(body.time_ms) : null,
    error: typeof body.error === "string" ? body.error.slice(0, 200) : "",
    fallback_from: typeof body.fallback_from === "string" && ALLOWED_PROVIDERS.has(body.fallback_from) ? body.fallback_from : "",
    duration_played_sec: typeof body.duration_played_sec === "number" ? Math.trunc(body.duration_played_sec) : null,
    sync_drift_sec: typeof body.sync_drift_sec === "number" ? body.sync_drift_sec : null,
  };

  try {
    const accessToken = (await cookies()).get("accessToken")?.value;
    if (accessToken) {
      await api.post("/api/v1/media/telemetry/playback/", safe, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }
  } catch {
    // fire-and-forget: swallow all errors
  }

  return noContent();
}
