import NotFoundPages from "@/components/elements/NotFound/NotFoundPages";
import BaseLayout from "@/components/layouts/BaseLayout";
import Page from "@/components/pages/profile/Page";
import ProfileBaseInformation from "@/components/pages/profile/ProfileBaseInformations";
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
      <Page>
        <ProfileBaseInformation profile={profile} />
      </Page>
    ) : (
      <NotFoundPages message="Perfil não encontrado" />
    ) }

    </BaseLayout>
  );
}
