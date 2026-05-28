/** Caminhos da sala no app (`/rooms/[slug]` e sufixos de sessão). */

export type RoomSessionMode = "watch" | "game";

export function roomBasePath(slug: string): string {
  return `/rooms/${encodeURIComponent(slug)}`;
}

export function roomWatchPath(slug: string): string {
  return `${roomBasePath(slug)}/watch`;
}

export function roomGamePath(slug: string): string {
  return `${roomBasePath(slug)}/game`;
}

export function roomSessionPath(slug: string, mode: RoomSessionMode): string {
  return mode === "watch" ? roomWatchPath(slug) : roomGamePath(slug);
}

export function parseRoomSessionModeFromPath(pathname: string): RoomSessionMode | null {
  if (pathname.endsWith("/watch")) return "watch";
  if (pathname.endsWith("/game")) return "game";
  return null;
}

/** Atualiza a URL sem remontar a página (evita perder estado ao entrar na transmissão). */
export function replaceRoomBrowserPath(path: string): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname === path) return;
  window.history.replaceState(window.history.state, "", path);
}

export function roomWatchEnteredStorageKey(slug: string): string {
  return `playgether:room-watch-session:${slug}`;
}
