import { FeedProvider } from "./context/FeedContext";
import FeedServerComponentsProvider from "./context/FeedServerComponentsProvider";
import { getFeedServer } from "./services/getFeedServer";

export default async function FeedLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const response = await getFeedServer();
  return (
    <>
      <FeedServerComponentsProvider>
        <FeedProvider response={response}>
          {children}
          {modal}
        </FeedProvider>
      </FeedServerComponentsProvider>
    </>
  );
}
