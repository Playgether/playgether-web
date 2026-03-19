import type { SteamStatusResponse } from "./getSteamStatus";

export async function disconnectSteam(): Promise<{ disconnected: boolean }> {
  const resp = await fetch("/api/steam/disconnect/", { method: "POST" });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || "Failed to disconnect Steam");
  }
  return (await resp.json()) as { disconnected: boolean };
}

