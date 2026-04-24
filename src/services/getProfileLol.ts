import { getLolStats, type LolStatsResponse } from "./getLolStats";

export type ProfileLolProps = LolStatsResponse;

export async function getProfileLol(
  _authTokens: unknown,
  id: number | undefined
): Promise<ProfileLolProps | null> {
  if (!id) return null;
  try {
    return await getLolStats(id, {
      timeScope: "platform",
      queueScope: "competitive",
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}