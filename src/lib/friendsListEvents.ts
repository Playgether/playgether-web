/** Mesma janela (e extensível). */
export const FRIENDS_LIST_INVALIDATE_EVENT = "playgether:friends-changed";

const BROADCAST_CHANNEL = "playgether-friends-invalidate";

export function notifyFriendsListChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FRIENDS_LIST_INVALIDATE_EVENT));
  try {
    const bc = new BroadcastChannel(BROADCAST_CHANNEL);
    bc.postMessage("invalidate");
    bc.close();
  } catch {
    /* modo privado / indisponível */
  }
}

/** Inclui outras abas do mesmo origin (ex.: seguir no perfil numa aba, feed noutra). */
export function subscribeFriendsListInvalidate(onInvalidate: () => void): () => void {
  const onWindow = () => onInvalidate();
  window.addEventListener(FRIENDS_LIST_INVALIDATE_EVENT, onWindow);

  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(BROADCAST_CHANNEL);
    bc.onmessage = () => onInvalidate();
  } catch {
    /* ignore */
  }

  return () => {
    window.removeEventListener(FRIENDS_LIST_INVALIDATE_EVENT, onWindow);
    bc?.close();
  };
}
