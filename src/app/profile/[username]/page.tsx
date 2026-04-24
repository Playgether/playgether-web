import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { Metadata } from "next";
import NotFoundPages from "@/components/elements/NotFound/NotFoundPages";
import { getProfileByUsername } from "@/services/getProfileByUsername";
import GamesCanvasProfile from "@/components/pages/profile/GamesCanvasProfile";
import { getCommentsServer } from "@/services/getCommentsServer";
import { notFound } from "next/navigation";
import { ensureAccessTokenCookie } from "@/actions/refreshToken";
import { decodeAccessToken } from "@/lib/decodeAccessToken";
export const metadata: Metadata = {
  title: "Playgether - Profile",
  description: "Find people to chat with",
};

export interface Props {
  params?: { username: string };
}
export default async function Profile({ params }) {
  const { username } = await params;
  const token = await ensureAccessTokenCookie();

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
    const pl = decodeAccessToken(token);
    if (pl?.username) {
      usernameToFetch = pl.username;
    }
  }

  const profileResponse = await getProfileByUsername(usernameToFetch);
  const profileData = profileResponse?.data;
  const profile = Array.isArray(profileData) ? profileData[0] : profileData;

  if (!profile) {
    notFound();
  }

  const initialComments = await getCommentsServer(
    usernameToFetch,
    null,
    "profiles",
  );

  return (
    <BaseLayout>
      <GamesCanvasProfile profile={profile} initialComments={initialComments} />
    </BaseLayout>
  );
}
