"use client";

import type { RoomExpelledPayload } from "@/lib/roomExpelledStorage";
import { consumeRoomExpelledMessage } from "@/lib/roomExpelledStorage";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/** Lê expulsão uma vez (query ou sessionStorage) para exibir no card da sala. */
export function useRoomExpelledForList(): RoomExpelledPayload | null {
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<RoomExpelledPayload | null>(null);

  useEffect(() => {
    const slugFromQuery = searchParams?.get("expelled_slug");
    const msgFromQuery = searchParams?.get("expelled_msg");
    const legacyQuery = searchParams?.get("expelled");

    if (slugFromQuery && msgFromQuery) {
      setPayload({ slug: slugFromQuery, message: msgFromQuery });
    } else if (legacyQuery) {
      setPayload({ slug: "", message: legacyQuery });
    } else {
      setPayload(consumeRoomExpelledMessage());
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("expelled_slug");
    url.searchParams.delete("expelled_msg");
    url.searchParams.delete("expelled");
    window.history.replaceState({}, "", url.pathname + url.search);
  }, [searchParams]);

  return payload;
}
