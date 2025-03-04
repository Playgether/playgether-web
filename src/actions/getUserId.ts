"use server";
import { cookies } from "next/headers";

export async function getFeed(pageParam: string | null = null) {
  const userId = (await cookies()).get("user_id")?.value;
  return userId;
}
