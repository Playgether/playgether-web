// app/profile/page.tsx
import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { Metadata } from "next";
import NotFoundPages from "@/components/elements/NotFound/NotFoundPages";
import { getProfileByUsername } from "@/services/getProfileByUsername";
import GamesCanvasProfile from "@/components/pages/profile/GamesCanvasProfile";
import { getCommentsServer } from "@/services/getCommentsServer";
import { getCurrentUsername } from "@/lib/server/currentUser";

export const metadata: Metadata = {
  title: "Profile",
  description: "See your and your friends informations",
};

export default async function PageProfile() {
  const username = await getCurrentUsername();

  if (!username) {
    return (
      <BaseLayout>
        <NotFoundPages message="Token não encontrado" />
      </BaseLayout>
    );
  }

  const [profileResponse, commentsResponse] = await Promise.all([
    getProfileByUsername(username), // GET /api/v1/profiles/username/
    getCommentsServer(username, null, "profiles"), // GET /api/v1/profiles/username/comments/
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
