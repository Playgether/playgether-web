import { api } from "./api";
import { cookies } from "next/headers";

export interface getProfileByUsernameProps {
  id: number;
  bio: string;
  profile_photo: string;
  hours_played: number;
  matches_played: number;
  performance: string;
  gamer_nivel: number;
  verified: boolean;
  quantity_comment: number;
  quantity_likes: number;
  follows: [];
  followed_by: [];
  name: string;
}
export const getProfileByUsername = async (
  username: string
) => {
  const accessToken = (await cookies()).get("accessToken")?.value;
  try {
    const response = await api.get<getProfileByUsernameProps>(
      `/api/v1/profiles/?user__username=${username}`,
      {
        headers: {
          Authorization: "Bearer " + String(accessToken),
        },
      }
    );
    return response;
  } catch (error) {
    notFound: true;
    return error;
  }
};
