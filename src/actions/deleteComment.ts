"use server";
import { api } from "@/services/api";
import { cookies } from "next/headers";

export const deleteCommentAction = async (id: number) => {
  const accessToken = (await cookies()).get("accessToken")?.value;
  try {
    await api.delete(`/api/v1/comments/${id}/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
