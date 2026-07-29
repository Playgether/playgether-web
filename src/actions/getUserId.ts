"use server";

import { ensureSessionAuth } from "@/actions/refreshToken";

export async function getUserId() {
  const session = await ensureSessionAuth();
  return session?.userId;
}
