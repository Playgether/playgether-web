import BaseLayout from "@/components/layouts/BaseLayout";
import Page from "@/components/pages/profile/Page";
import ProfileBaseInformation from "@/components/pages/profile/ProfileBaseInformations";
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
  return (
    <BaseLayout>
      <Page>
        <ProfileBaseInformation username={username} />
      </Page>
    </BaseLayout>
  );
}
