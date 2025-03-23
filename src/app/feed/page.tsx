import { Metadata } from "next";
import BaseLayout from "../../components/layouts/BaseLayout";
import { FeedFetchComponent } from "../../components/pages/feed/CommonComponents/FeedFetchComponent";
import { FeedContextProvider } from "../../context/FeedContext";

export const metadata: Metadata = {
  title: "Playgether - Feed",
  description: "Share your posts and interact with the posts of your friends",
};

export default async function Feed() {
  return (
    <BaseLayout>
      <FeedContextProvider>
        <FeedFetchComponent />
      </FeedContextProvider>
    </BaseLayout>
  );
}
