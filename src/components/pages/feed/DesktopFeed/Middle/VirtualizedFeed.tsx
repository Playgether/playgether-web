"use client";
import ProfileAndUsername from "@/components/layouts/components/ProfileAndUsername";
import { Virtuoso } from "react-virtuoso";
import PostProperies from "./PostsComponents/PostsProperies";
import Posts from "./PostsComponents/Posts/Posts";
import PostText from "@/components/layouts/PostText/PostText";
import { useFeedContext } from "@/context/FeedContext";
import { useCallback, useEffect, useState } from "react";
import { useMiddleFeedContext } from "@/context/MiddleFeedContext";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";

const VirtualizedFeed = () => {
  const { feed, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useFeedContext();
  const { setSlideIndex, handlePostsExtend } = useMiddleFeedContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!feed) {
      return;
    }
    if (feed?.length > 0) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [feed]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      {loading ? (
        <div className="h-[calc(100vh-210px)] flex items-center justify-center">
          <LoadingComponent className="h-8 w-8" />
        </div>
      ) : (
        <Virtuoso
          increaseViewportBy={200}
          style={{ height: "100%" }}
          useWindowScroll
          data={feed}
          endReached={loadMore}
          overscan={3}
          itemContent={(index, resource) => (
            <div
              key={resource.id}
              className="VirtualizedFeed-wrapper rounded-xl transition-shadow duration-100 ease-out hover:shadow-md hover:shadow[var(--shadow-color)]"
            >
              <div className="flex items-start justify-start">
                <ProfileAndUsername
                  username={resource.created_by_user_name}
                  profile_photo={resource.created_by_user_photo}
                  imageClassName="mt-3 ml-3 h-10 w-10"
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

              <div className="mb-5 rounded-xl">
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
      )}
    </>
  );
};

export default VirtualizedFeed;
