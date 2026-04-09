"use client";

import { useEffect, useState } from "react";

export function formatRemainingMs(ms: number): string {
  if (ms <= 0) return "expirando…";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** Atualiza o rótulo a cada segundo a partir de `expires_at` ISO. */
export function useLiveExpiryLabel(expiresAtIso: string | null | undefined): string | null {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    if (!expiresAtIso) {
      setLabel(null);
      return;
    }
    const tick = () => {
      const diff = new Date(expiresAtIso).getTime() - Date.now();
      setLabel(formatRemainingMs(diff));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAtIso]);
  return label;
}
