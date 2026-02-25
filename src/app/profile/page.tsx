// app/profile/page.tsx
import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import NotFoundPages from "@/components/elements/NotFound/NotFoundPages";
import { getProfileByUsername } from "@/services/getProfileByUsername";
import GamesCanvasProfile from "@/components/pages/profile/GamesCanvasProfile";

export const metadata: Metadata = {
  title: "Playgether - Profile",
  description: "See your and your friends informations",
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET); 

export default async function PageProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return (
      <BaseLayout>
        <NotFoundPages message="Token não encontrado" />
      </BaseLayout>
    );
  }

  let payload: Record<string, any>;
  try {
    const { payload: pl } = await jwtVerify(token, secret);
    payload = pl as Record<string, any>;
  } catch (err) {
    console.error("JWT inválido:", err);
    return (
      <BaseLayout>
        <NotFoundPages message="Token expirado ou inválido" />
      </BaseLayout>
    );
  }

  const username = payload.username;
  const response = await getProfileByUsername(username);
  const profile = response.data[0];
  return (
    <BaseLayout>
      {profile ? (
        <GamesCanvasProfile profile={profile} />
      ):(
        <NotFoundPages message="Perfil não encontrado" />
      )}
    </BaseLayout>
  );
}
