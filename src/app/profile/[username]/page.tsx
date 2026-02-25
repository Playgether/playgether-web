import NotFoundPages from "@/components/elements/NotFound/NotFoundPages";
import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import GamesCanvasProfile from "@/components/pages/profile/GamesCanvasProfile";
import { getProfileByUsername } from "@/services/getProfileByUsername";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playgether - Profile",
  description: "Find people to chat with",
};

export interface Props {
  params?: { username: string };
}
export default async function Profile({ params }) {
  const {username} = await params;
  const response = await getProfileByUsername(username);
  const profile = response.data[0];
  return (
    <BaseLayout>
    {profile ? (
      <GamesCanvasProfile profile={profile} />
    ) : (
      <NotFoundPages message="Perfil não encontrado" />
    ) }

    </BaseLayout>
  );
}
