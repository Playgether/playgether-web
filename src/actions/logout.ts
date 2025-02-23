"use server";

import { cookies } from "next/headers";

export async function logoutServer() {
  (await cookies()).delete("accessToken");
  (await cookies()).delete("refreshToken");
  (await cookies()).delete("user_id");
}
