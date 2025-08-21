import { Metadata } from "next";
import { FeedFetchComponent } from "../../components/pages/feed/CommonComponents/FeedFetchComponent";
import { FeedContextProvider } from "../../context/FeedContext";
import BaseLayout from "../base-layout/components/structure/BaseLayout";

export const metadata: Metadata = {
  title: "Playgether - Feed",
  description: "Share your posts and interact with the posts of your friends",
};

export default async function Feed() {
  return (
    <BaseLayout>
      <FeedContextProvider>
        {/* <FeedFetchComponent /> */}
        <p></p>
      </FeedContextProvider>
    </BaseLayout>
  );
}
