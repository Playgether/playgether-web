import { notFound } from "next/navigation";
import { api } from "./api";
import { TokenData } from "./updateTokenRequest";

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
  authTokens: TokenData | undefined | null,
  username: string
) => {
  try {
    const response = await api.get<getProfileByUsernameProps>(
      `/api/v1/profiles/?user__username=${username}`,
      {
        headers: {
          Authorization: "Bearer " + String(authTokens?.access),
        },
      }
    );
    return response;
  } catch (error) {
    notFound: true;
    return error;
  }
};
