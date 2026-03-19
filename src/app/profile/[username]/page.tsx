import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import NotFoundPages from "@/components/elements/NotFound/NotFoundPages";
import { getProfileByUsername } from "@/services/getProfileByUsername";
import GamesCanvasProfile from "@/components/pages/profile/GamesCanvasProfile";
import { getCommentsServer } from "@/services/getCommentsServer";
export const metadata: Metadata = {
  title: "Playgether - Profile",
  description: "Find people to chat with",
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface Props {
  params?: { username: string };
}
export default async function Profile({ params }) {
  const { username } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return (
      <BaseLayout>
        <NotFoundPages message="Token não encontrado" />
      </BaseLayout>
    );
  }

  // Suporta URLs de aba no formato `/profile/<tab>`.
  // Como existe o route `/profile/[username]`, precisamos detectar quando
  // o "username" é na verdade um slug de aba.
  const tabSlugs = new Set([
    "bio",
    "midias",
    "textos",
    "estatisticas",
    "marcos",
    "conquistas",
    "biblioteca",
  ]);

  const normalizedParam = String(username)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  let usernameToFetch = username;
  if (tabSlugs.has(normalizedParam)) {
    try {
      const { payload: pl } = await jwtVerify(token, secret);
      usernameToFetch = (pl as any).username;
    } catch {
      usernameToFetch = username;
    }
  }

  const [profileResponse, commentsResponse] = await Promise.all([
    getProfileByUsername(usernameToFetch), // GET /api/v1/profiles/username/
    getCommentsServer(usernameToFetch, null, "profiles"), // GET /api/v1/profiles/username/comments/
  ]);

  const profile = profileResponse.data?.[0] || profileResponse.data;
  const initialComments = commentsResponse;

  return (
    <BaseLayout>
      {profile ? (
        <GamesCanvasProfile
          profile={profile}
          initialComments={initialComments}
        />
      ) : (
        <NotFoundPages message="Perfil não encontrado" />
      )}
    </BaseLayout>
  );
}
