"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { LoadingPosts } from "./LoadingPosts";
import { LoadingComments } from "./LoadingComments";
import dynamic from "next/dynamic";
import { Component2 } from "./Component2";
import Component from "./Component";
import { ComponentTest } from "./ComponentTest";
import { ComponentTest2 } from "./ComponentTest2";
import App from "./Almost1";
import { useFeedContext } from "../../context/FeedContext";
import Posts from "../../components/pages/feed/DesktopFeed/Middle/PostsComponents/Posts/Posts";
import { CldVideoPlayer, getCldVideoUrl } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { CustomPagination } from "@/components/elements/CustomPagination/CustomPagination";
import ProfileAndUsername from "@/components/layouts/components/ProfileAndUsername";
import { Virtuoso } from "react-virtuoso";
import PostText from "@/components/layouts/PostText/PostText";
import PostProperies from "@/components/pages/feed/DesktopFeed/Middle/PostsComponents/PostsProperies";
import BaseLayout from "@/components/layouts/BaseLayout";
import FinishFeed from "@/components/pages/feed/DesktopFeed/MultUseComponents/FinishFeed";
import { VideoLoadingFallback } from "@/components/pages/feed/DesktopFeed/Middle/PostsComponents/Posts/VideoLoadingFallBack";
import { Skeleton } from "@/components/ui/skeleton";

// const url = getCldVideoUrl({
//   width: 1080,
//   height: 720,
//   src: 'gn7diews37kbo2ooko7u'
// });

export default async function TestPage() {
  const url = getCldVideoUrl({
    width: 1080,
    height: 720,
    src: "ahini9loos6m5sqru8lu",
  });
  const { feed, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeedContext();
  const [slideIndex, setSlideIndex] = useState(1);
  const medias = [
    {
      id: 20,
      media_file: "av0doj7wgvdghe8th9jy",
      media_type: "video",
    },
    {
      id: 20,
      media_file: "bvh6ojgigdhsxpouowun",
      media_type: "video",
    },
    {
      id: 20,
      media_file: "tlut4m61l8y9ppmoogfz",
      media_type: "video",
    },
  ];
  // return (
  //     <>
  //     <Suspense fallback={<LoadingPosts />}>
  //         <ComponentTest />
  //     </Suspense>
  //     <Suspense fallback={<LoadingComments />}>
  //         <ComponentTest2 />
  //     </Suspense>
  //     <App />
  //     </>
  // )
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    console.log(url);
  }, []);

  return (
    <BaseLayout>
      <div className="w-[1080px] text-black-300 max-h-[600px] flex flex-col gap-2 bg-green-400 justify-center items-center">
        <div className="w-[600px] rounded bg-red-400"></div>
        <Posts
          media={medias}
          onClick={() => false}
          slideIndex={0}
          postHeight={600}
          postWidth={600}
          className="max-w-[600px] h-[600px] w-full p-4"
        />
        {/* <div className="w-[600px] rounded bg-red-400">
          <CldVideoPlayer
            src="frdwntu18mar6k77gmlg"
            transformation={{ width: 1080, crop: "limit" }}
            quality={"auto:good"}
            fluid={false}
            className="w-fit object-contain rounded"
          />
        </div> */}
      </div>
    </BaseLayout>
  );
}
