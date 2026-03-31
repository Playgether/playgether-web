import { apiFetch } from "@/services/apiFetch";

export type RefreshAchievementsResult = {
  slug: string;
  newly_unlocked_ids: number[];
};

export async function refreshProfileAchievements(
  profileId: number,
  slug: string
): Promise<RefreshAchievementsResult> {
  const res = await apiFetch(
    `/api/games/profiles/${profileId}/achievements/refresh/`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { detail?: string }).detail ?? "Falha ao atualizar conquistas"
    );
  }
  return (await res.json()) as RefreshAchievementsResult;
}
