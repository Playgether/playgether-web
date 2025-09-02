import { Metadata } from "next";
import BaseLayout from "../base-layout/components/structure/BaseLayout";
import FeedPage from "./components/FeedPage";
import FeedServerComponentsProvider from "./context/FeedServerComponentsProvider";
import { getFeed } from "./services/getFeed";
import { FeedProvider } from "./context/FeedContext";

export const metadata: Metadata = {
  title: "Playgether - Feed",
  description: "Share your posts and interact with the posts of your friends",
};

export default async function Feed() {
  const response = await getFeed();
  return (
    <BaseLayout>
      <FeedServerComponentsProvider>
        <FeedProvider response={response}>
          <FeedPage />
        </FeedProvider>
      </FeedServerComponentsProvider>
    </BaseLayout>
  );
}
