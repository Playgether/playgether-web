import BaseLayout from "@/components/layouts/BaseLayout";
import Page from "@/components/pages/profile/Page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chatting Rooms",
  description: "Find people to chat with",
};

export default function PageProfile() {
  return (
    <BaseLayout>
      <Page />
    </BaseLayout>
  );
}
