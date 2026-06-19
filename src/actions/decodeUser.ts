"use server";

import { cookies } from "next/headers";
import { UserProps } from "@/context/AuthContext";
import jwt_decode from "jwt-decode";

// export async function decodeUser() {
//   const user = (await cookies()).get("user");
//   if (!user) return null;
//   const userJson = JSON.parse(user?.value);
//   return userJson as UserProps;
// }

type JwtPayload = UserProps & { user_id?: string };

export async function decodeUser(): Promise<UserProps | null> {
  const accessToken = (await cookies()).get("accessToken");

  if (!accessToken) return null;

  const decodedAccessToken = jwt_decode<JwtPayload>(accessToken.value);

  const filteredUser: UserProps = {
    username: decodedAccessToken.username,
    first_name: decodedAccessToken.first_name,
    last_name: decodedAccessToken.last_name,
    user_id: decodedAccessToken.user_id || undefined,
  };

  return filteredUser;
}
