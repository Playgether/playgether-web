import { apiFetch } from "@/services/apiFetch";

export type LolForceRefresh = {
  cooldown_seconds: number;
  next_allowed_at: string | null;
  remaining_seconds: number;
  allowed: boolean;
  blocked_by_cooldown: boolean;
};

export type SyncLolStatsResponse = {
  synced: boolean;
  reason?: string;
  lastSyncedAt?: string | null;
  warning?: string | null;
  force_refresh?: LolForceRefresh;
};

export async function syncLolStats(
  profileId: number
): Promise<SyncLolStatsResponse> {
  const res = await apiFetch(`/api/games/profiles/${profileId}/lol/sync/`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to sync LoL stats");
  }
  return (await res.json()) as SyncLolStatsResponse;
}
