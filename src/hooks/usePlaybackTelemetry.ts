/**
 * Collects YouTube IFrame API lifecycle events and fires telemetry beacons.
 * Attach this to the YouTube player via onStateChange / onReady / onError callbacks.
 */

import { useCallback, useRef } from "react";
import { sendPlaybackEvent } from "@/lib/telemetry/client";
import type { PlaybackTelemetryPayload } from "@/lib/telemetry/events";
import type { ProviderName } from "@/types/RoomMusic";

interface PlaybackTelemetryContext {
  roomSlug: string;
  provider: ProviderName;
  canonicalTrackId?: string;
}

export function usePlaybackTelemetry(ctx: PlaybackTelemetryContext) {
  const startedAtRef = useRef<number | null>(null);
  const readyAtRef = useRef<number | null>(null);

  const base = useCallback(
    (overrides: Partial<PlaybackTelemetryPayload>): PlaybackTelemetryPayload => ({
      event_type: "PLAYBACK_STARTED",
      room_slug: ctx.roomSlug,
      provider: ctx.provider,
      canonical_track_id: ctx.canonicalTrackId,
      ...overrides,
    }),
    [ctx.roomSlug, ctx.provider, ctx.canonicalTrackId],
  );

  const onPlayerReady = useCallback(() => {
    readyAtRef.current = performance.now();
    sendPlaybackEvent(base({ event_type: "PLAYER_READY" }));
  }, [base]);

  const onIframeLoad = useCallback(
    (success: boolean, errorMsg?: string) => {
      sendPlaybackEvent(
        base({
          event_type: success ? "IFRAME_LOAD_SUCCESS" : "IFRAME_LOAD_FAILED",
          error: errorMsg,
        }),
      );
    },
    [base],
  );

  const onPlaybackStarted = useCallback(() => {
    const now = performance.now();
    startedAtRef.current = now;
    const timeToFirstPlay =
      readyAtRef.current != null ? Math.round(now - readyAtRef.current) : undefined;
    sendPlaybackEvent(
      base({ event_type: "PLAYBACK_STARTED", time_ms: timeToFirstPlay }),
    );
    if (timeToFirstPlay != null) {
      sendPlaybackEvent(
        base({ event_type: "TIME_TO_FIRST_PLAY", time_ms: timeToFirstPlay }),
      );
    }
  }, [base]);

  const onAutoplayBlocked = useCallback(() => {
    sendPlaybackEvent(base({ event_type: "AUTOPLAY_BLOCKED" }));
  }, [base]);

  const onPlaybackStalled = useCallback(() => {
    sendPlaybackEvent(base({ event_type: "PLAYBACK_STALLED" }));
  }, [base]);

  const onPlaybackAbandoned = useCallback(
    (durationPlayedSec?: number) => {
      sendPlaybackEvent(
        base({ event_type: "PLAYBACK_ABANDONED", duration_played_sec: durationPlayedSec }),
      );
    },
    [base],
  );

  return {
    onPlayerReady,
    onIframeLoad,
    onPlaybackStarted,
    onAutoplayBlocked,
    onPlaybackStalled,
    onPlaybackAbandoned,
  };
}
