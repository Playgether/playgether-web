"use client";

import { useSyncExternalStore } from "react";

const LG_QUERY = "(min-width: 1024px)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(LG_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(LG_QUERY).matches;
}

function getServerSnapshot() {
  return true;
}

/** true = layout desktop (lg+), false = mobile/tablet */
export function useIsLgDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
