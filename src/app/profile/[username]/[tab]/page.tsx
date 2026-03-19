import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { Metadata } from "next";
import { cookies } from "next/headers";
import NotFoundPages from "@/components/elements/NotFound/NotFoundPages";
import { getProfileByUsername } from "@/services/getProfileByUsername";
import GamesCanvasProfile from "@/components/pages/profile/GamesCanvasProfile";
import { getCommentsServer } from "@/services/getCommentsServer";

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

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return (
      <BaseLayout>
        <NotFoundPages message="Token não encontrado" />
      </BaseLayout>
    );
  }

  const [profileResponse, commentsResponse] = await Promise.all([
    getProfileByUsername(username),
    getCommentsServer(username, null, "profiles"),
  ]);

  const profile = profileResponse.data?.[0] || profileResponse.data;
  const initialComments = commentsResponse;

  return (
    <BaseLayout>
      {profile ? (
        <GamesCanvasProfile profile={profile} initialComments={initialComments} />
      ) : (
        <NotFoundPages message="Perfil não encontrado" />
      )}
    </BaseLayout>
  );
}

