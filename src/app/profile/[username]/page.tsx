import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { Metadata } from "next";
import NotFoundPages from "@/components/elements/NotFound/NotFoundPages";
import { getProfileByUsername } from "@/services/getProfileByUsername";
import GamesCanvasProfile from "@/components/pages/profile/GamesCanvasProfile";
import { getCommentsServer } from "@/services/getCommentsServer";
import { notFound } from "next/navigation";
import { ensureAccessTokenCookie } from "@/lib/server/authTokens";
import { getCurrentUsername } from "@/lib/server/currentUser";

export const metadata: Metadata = {
  title: "Profile",
  description: "Find people to chat with",
};

export interface Props {
  params?: { username: string };
}

const PROFILE_TAB_SLUGS = new Set([
  "bio",
  "midias",
  "textos",
  "reposts",
  "estatisticas",
  "marcos",
  "conquistas",
  "biblioteca",
  "curtidas",
  "salvos",
]);

function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
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
  let usernameToFetch = username;
  if (PROFILE_TAB_SLUGS.has(normalizeSlug(username))) {
    const meUsername = await getCurrentUsername();
    if (!meUsername) {
      return (
        <BaseLayout>
          <NotFoundPages message="Token não encontrado" />
        </BaseLayout>
      );
    }
    usernameToFetch = meUsername;
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
