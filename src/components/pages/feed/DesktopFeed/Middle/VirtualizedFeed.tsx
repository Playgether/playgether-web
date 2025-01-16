import ProfileAndUsername from "@/components/layouts/components/ProfileAndUsername";
import { Virtuoso } from "react-virtuoso";
import PostProperies from "./PostsComponents/PostsProperies";
import Posts from "./PostsComponents/Posts/Posts";
import PostText from "@/components/layouts/PostText/PostText";
import { useFeedContext } from "@/context/FeedContext";
import { useCallback } from "react";

const VirtualizedFeed = ({ setSlideIndex, handlePostsExtend }) => {
  const { feed, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useFeedContext();

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Virtuoso
      increaseViewportBy={200}
      style={{ height: "100%" }}
      useWindowScroll
      data={feed}
      endReached={loadMore}
      overscan={3}
      itemContent={(index, resource) => (
        <div key={resource.id} className="VirtualizedFeed-wrapper rounded-xl">
          <div className="flex items-start justify-start">
            <ProfileAndUsername
              username={resource.created_by_user_name}
              profile_photo={resource.created_by_user_photo}
              imageClassName="mt-3 ml-3 h-16 w-16"
              timestamp={resource.timestamp}
            />
          </div>
          <div
            className="pt-4 flex min-h-[5rem] pb-4 cursor-pointer"
            onClick={() => handlePostsExtend(resource)}
          >
            <PostText resource={resource} maxCharacteres={300} />
          </div>

          {resource?.has_post_media && (
            <div className="cursor-pointer">
              <Posts
                media={resource.medias}
                onClick={() => handlePostsExtend(resource)}
                setSlideIndex={setSlideIndex}
                postHeight={720}
                postWidth={1280}
                className="w-[600px] p-4 h-[368px]"
              />
            </div>
          )}

          <div className="mb-5 shadow-lg">
            <PostProperies
              object_id={resource.id}
              user_already_like={resource.user_already_like}
              quantity_comment={resource.quantity_comment}
              quantity_likes={resource.quantity_likes}
              quantity_reposts={resource.quantity_reposts}
            />
          </div>
        </div>
      )}
    />
  );
};

export default VirtualizedFeed;
