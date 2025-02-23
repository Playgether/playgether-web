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

export async function decodeUser(): Promise<Omit<UserProps, "id"> | null> {
  const accessToken = (await cookies()).get("accessToken");

  if (!accessToken) return null;

  const decodedAccessToken: UserProps = jwt_decode(accessToken.value);

  const filteredUser: Omit<UserProps, "id"> = {
    username: decodedAccessToken.username,
    first_name: decodedAccessToken.first_name,
    last_name: decodedAccessToken.last_name,
  };

  return filteredUser;
}
