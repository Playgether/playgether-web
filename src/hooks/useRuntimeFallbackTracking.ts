/**
 * Tracks when the active provider changes at runtime (user-triggered or automatic fallback).
 * Emits a PROVIDER_SWITCHED_RUNTIME event when the provider differs from the previous one.
 */

import { useEffect, useRef } from "react";
import { sendPlaybackEvent } from "@/lib/telemetry/client";
import type { ProviderName } from "@/types/RoomMusic";

interface RuntimeFallbackContext {
  roomSlug: string;
  canonicalTrackId?: string;
  activeProvider: ProviderName | undefined;
}

export function useRuntimeFallbackTracking({
  roomSlug,
  canonicalTrackId,
  activeProvider,
}: RuntimeFallbackContext): void {
  const prevProviderRef = useRef<ProviderName | undefined>(undefined);

  useEffect(() => {
    const prev = prevProviderRef.current;
    if (activeProvider && prev !== undefined && prev !== activeProvider) {
      sendPlaybackEvent({
        event_type: "PROVIDER_SWITCHED_RUNTIME",
        room_slug: roomSlug,
        provider: activeProvider,
        canonical_track_id: canonicalTrackId,
        fallback_from: prev,
      });
    }
    prevProviderRef.current = activeProvider;
  }, [activeProvider, roomSlug, canonicalTrackId]);
}
