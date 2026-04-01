import { apiFetch } from "@/services/apiFetch";
import type { HighlightedAchievementPublic } from "@/types/highlightedAchievements";

export async function setProfileAchievementHighlights(
  profileId: number,
  achievementIds: number[],
): Promise<{ highlighted_achievements: HighlightedAchievementPublic[] }> {
  const res = await apiFetch(
    `/api/games/profiles/${profileId}/achievements/highlights/`,
    {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ achievement_ids: achievementIds }),
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail =
      typeof err?.detail === "string"
        ? err.detail
        : "Não foi possível atualizar os destaques.";
    throw new Error(detail);
  }
  return (await res.json()) as {
    highlighted_achievements: HighlightedAchievementPublic[];
  };
}
