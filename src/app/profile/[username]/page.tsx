import BaseLayout from "@/components/layouts/BaseLayout";
import Page from "@/components/pages/profile/Page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playgether - Profile",
  description: "Find people to chat with",
};

export interface Props {
  params?: { username: string };
}
export default function Profile({ params }: Props) {
  return (
    <BaseLayout>
      <Page params={params} />
    </BaseLayout>
  );
}
