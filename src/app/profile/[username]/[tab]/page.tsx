import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { Metadata } from "next";
import NotFoundPages from "@/components/elements/NotFound/NotFoundPages";
import { ensureAccessTokenCookie } from "@/actions/refreshToken";
import { getProfileByUsername } from "@/services/getProfileByUsername";
import GamesCanvasProfile from "@/components/pages/profile/GamesCanvasProfile";
import { getCommentsServer } from "@/services/getCommentsServer";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Playgether - Profile",
  description: "Find people to chat with",
};

export interface Props {
  params?: { username: string; tab: string };
}

export default async function ProfileWithTab({
  params,
}: {
  params: Promise<{ username: string; tab: string }>;
}) {
  const { username } = await params;
  if (!username) {
    return (
      <BaseLayout>
        <NotFoundPages message="Perfil não encontrado" />
      </BaseLayout>
    );
  }

  if (!(await ensureAccessTokenCookie())) {
    return (
      <BaseLayout>
        <NotFoundPages message="Token não encontrado" />
      </BaseLayout>
    );
  }

  const profileResponse = await getProfileByUsername(username);
  const profileData = profileResponse?.data;
  const profile = Array.isArray(profileData) ? profileData[0] : profileData;

  if (!profile) {
    notFound();
  }

  const initialComments = await getCommentsServer(username, null, "profiles");

  return (
    <BaseLayout>
      <GamesCanvasProfile profile={profile} initialComments={initialComments} />
    </BaseLayout>
  );
}

