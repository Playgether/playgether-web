"use server";
import { api } from "@/services/api";
import { ProfileProps } from "@/types/ProfileProps";
import { cookies } from "next/headers";

export async function getProfile() {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const userId = (await cookies()).get("user_id")?.value;
  try {
    const response = await api.get<ProfileProps[]>(
      `/api/v1/users/${userId}/profiles/`,
      {
        headers: {
          Authorization: "Bearer " + String(accessToken),
        },
      }
    );
    return response;
  } catch (error) {
    return error;
  }
}
