import BaseLayout from "@/components/layouts/BaseLayout";
import Page from "@/components/pages/profile/Page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playgether - Profile",
  description: "See your and your friends informations",
};

export default function PageProfile() {
  return (
    <BaseLayout>
      <Page />
    </BaseLayout>
  );
}
