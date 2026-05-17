/**
 * Fire-and-forget telemetry client.
 * Uses navigator.sendBeacon so the request survives page unload.
 * Falls back to a no-op when sendBeacon is unavailable (SSR, tests).
 */

import type { PlaybackTelemetryPayload } from "./events";

const ENDPOINT = "/api/telemetry/playback";

export function sendPlaybackEvent(payload: PlaybackTelemetryPayload): void {
  if (typeof navigator === "undefined" || !navigator.sendBeacon) return;
  try {
    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });
    navigator.sendBeacon(ENDPOINT, blob);
  } catch {
    // telemetry must never throw
  }
}
