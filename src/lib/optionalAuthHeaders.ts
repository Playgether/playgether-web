import { cookies } from "next/headers";

/** Bearer header only when an access token cookie exists (guest-safe). */
export async function optionalAuthHeaders(): Promise<
  Record<string, string> | undefined
> {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return undefined;
  return { Authorization: `Bearer ${accessToken}` };
}
