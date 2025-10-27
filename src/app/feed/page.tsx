import { Metadata } from "next";
import BaseLayout from "../base-layout/components/structure/BaseLayout";
import FeedPage from "./components/FeedPage";

export const metadata: Metadata = {
  title: "Playgether - Feed",
  description: "Share your posts and interact with the posts of your friends",
};

export default async function Feed() {
  return (
    <BaseLayout>
      <FeedPage />
    </BaseLayout>
  );
}
