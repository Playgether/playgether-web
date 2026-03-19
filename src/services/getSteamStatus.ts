import { apiFetch } from "@/services/apiFetch";

export type SteamStatusResponse = {
  connected: boolean;
  nickname: string | null;
  avatar: string | null;
  steam_profile_public: boolean;
};

export async function getSteamStatus(profileId: number): Promise<SteamStatusResponse> {
  const res = await apiFetch(`/api/steam/status/${profileId}`, { method: "GET" });
  if (!res.ok) {
    throw new Error("Failed to fetch Steam status");
  }
  return (await res.json()) as SteamStatusResponse;
}

