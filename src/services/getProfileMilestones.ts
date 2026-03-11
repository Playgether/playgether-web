export interface ProfileMilestoneMedia {
  id: number;
  media_url: string;
  media_type: "image" | "video";
  public_id: string;
}

export interface ProfileMilestone {
  id: number;
  profile: number;
  title: string;
  description: string | null;
  date: string;
  has_media: boolean;
  created_at: string;
  updated_at: string;
  medias: ProfileMilestoneMedia[];
}

export interface ProfileMilestonesResponse {
  data: ProfileMilestone[];
  next_page: string | null;
  previous_page?: string | null;
}

export async function getProfileMilestonesClient(
  profilePk: string | number,
  cursor: string | null = null,
  pageSize: number = 10
): Promise<ProfileMilestonesResponse> {
  try {
    const url = new URL(`/api/profiles/${profilePk}/milestones`, window.location.origin);
    url.searchParams.set("page_size", String(pageSize));
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url.toString(), { credentials: "include" });

    if (!response.ok) {
      if (response.status === 401) return { data: [], next_page: null };
      throw new Error("Failed to fetch milestones");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return { data: [], next_page: null };
  }
}
