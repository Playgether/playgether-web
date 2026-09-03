"use server";

import { ensureSessionAuth } from "@/lib/server/authTokens";

export async function getUserId() {
  const session = await ensureSessionAuth();
  return session?.userId;
}
