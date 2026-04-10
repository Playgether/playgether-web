"use client";

import { useLayoutEffect, useState } from "react";

const PROFILE_CARD_SELECTOR = "[data-feed-user-profile-card]";

/**
 * Altura do card de perfil na coluna esquerda do feed (para alinhar max-height de outros cards).
 */
export function useFeedProfileCardHeight(): number | null {
  const [heightPx, setHeightPx] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = document.querySelector<HTMLElement>(PROFILE_CARD_SELECTOR);
    if (!el) return;

    const update = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) setHeightPx(Math.round(h));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return heightPx;
}
