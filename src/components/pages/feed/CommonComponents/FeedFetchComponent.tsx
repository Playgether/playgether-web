import ContentFeed from "../DesktopFeed/MultUseComponents/ContentFeed";

export const FeedFetchComponent = () => {
  return (
    <>
      <div className="hidden lg:flex flex-col h-full overflow-visible">
        <ContentFeed />
      </div>
      <div className="lg:hidden h-full w-full">
        <ResponsiveContainer />
      </div>
    </>
  );
};
