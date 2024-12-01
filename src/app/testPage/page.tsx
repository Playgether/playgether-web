"use client"

import { Suspense, useCallback, useState } from "react";
import { LoadingPosts } from "./LoadingPosts";
import { LoadingComments } from "./LoadingComments";
import dynamic from 'next/dynamic';
import { Component2 } from "./Component2";
import Component from "./Component";
import { ComponentTest } from "./ComponentTest";
import { ComponentTest2 } from "./ComponentTest2";
import App from "./Almost1";
import { useFeedContext } from "../../context/FeedContext";
import Posts from "../../components/pages/feed/DesktopFeed/Middle/PostsComponents/Posts/Posts";
import { CldVideoPlayer, getCldVideoUrl } from "next-cloudinary";
import 'next-cloudinary/dist/cld-video-player.css';
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
 
// const url = getCldVideoUrl({
//   width: 1080,
//   height: 720,
//   src: 'gn7diews37kbo2ooko7u'
// });

export default async function TestPage() {
    const { feed, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeedContext();
    const [slideIndex, setSlideIndex] = useState(1)
    const medias = [
        {
            id: 20,
            media_file:"uxfq2uxjbh9gtuzcavja",
            media_type:"image"
        },
        {
            id: 20,
            media_file:"hrpezhkivtc8jy8pfjqe",
            media_type:"video"
        },
        {
            id: 20,
            media_file:"pyyydgcoxv4qjbjmgont",
            media_type:"image"
        },
    ]
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
    
    return (
    <BaseLayout>
            <div className="w-[600px] text-black-300 h-[300px] 2xl:h-[400px] max-h-[600px] bg-red-400">
            <Suspense fallback={<VideoLoadingFallback/>}>
                <Posts media={medias} onClick={()=> false} slideIndex={0} postHeight={720} postWidth={1080} className="max-w-[600px] h-full w-full p-4"/>
            </Suspense>
        </div>
    </BaseLayout>
    )


}
