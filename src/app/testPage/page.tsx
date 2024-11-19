"use client"

import { Suspense, useState } from "react";
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
 
// const url = getCldVideoUrl({
//   width: 1080,
//   height: 720,
//   src: 'gn7diews37kbo2ooko7u'
// });

export default async function TestPage() {
    const { feed } = useFeedContext();
    const [slideIndex, setSlideIndex] = useState(1)
    const medias = [
        // {
        //     "id": 20,
        //     "media_file": "http://192.168.18.5:8000/media/posts/images/2d2554cb-b039-4936-b3c6-d7480c885d272024-10-08_190653.295039.jpg",
        //     "position": 1,
        //     "media_type": "image",
        //     "post": 1
        // },
        // {
        //     "id": 21,
        //     "media_file": "http://192.168.18.5:8000/media/posts/images/c76a0330-7e73-473c-bf35-175b071e48312024-10-08_190715.486904.jpg",
        //     "position": 2,
        //     "media_type": "image",
        //     "post": 1
        // },
        // {
        //     "id": 22,
        //     "media_file": "http://192.168.18.5:8000/media/posts/images/de6954f8-514e-4dde-ac9b-f0890ead07eb2024-10-08_190702.729856.jpg",
        //     "position": 3,
        //     "media_type": "image",
        //     "post": 1
        // },
        {
            "id": 22,
            "media_file": "http://192.168.18.5:8000/media/posts/videos/3e370939-e350-4f55-bd1d-5c49bf9798632024-10-09_215447.057663.mp4",
            "position": 3,
            "media_type": "video",
            "post": 1
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
    return (
        <>
        <div className="bg-white-200 h-screen overflow-y-auto grid grid-cols-[1fr_700px_1fr] text-black-500">
            {/* <div className="bg-blue-500 grow">
                <p>Child 1</p>
            </div>
            <div className="bg-red-500 h-[1000px] w-[400px]">
                <p>Child 2</p>
            </div>
            <div className="bg-green-500 grow">
                <p>Child 3</p>
            </div> */}
            {/* <CldVideoPlayer src="gn7diews37kbo2ooko7u" width={1920} height={1080}/>  */}
            <Swiper
                // slidesPerView={1}
                // pagination={{type:'fraction', el:'.swiper-custom-pagination',}}
                // navigation
                // modules={[Navigation, Pagination]}
                // className='h-full z-10 relative'
                // // onSlideChange={handleSlideChange}
                // initialSlide={slideIndex}
                // autoHeight={true}
                noSwiping={true}
                noSwipingClass="swiper-no-swiping"
            >
                <CustomPagination/>
                <SwiperSlide>
                    <div className="w-[1080px] h-[500px] bg-red-500 swiper-no-swiping">
                        <CldVideoPlayer src="gn7diews37kbo2ooko7u"
                        className="object-cover"
                        width={1080} height={500} 
                        autoPlay="on-scroll" 
                        colors={{accent:"orange", text:"orange"}} 
                        playbackRates={["0.25", "0.5", "0.75", "1", "1.25", "1.50", "1.75", "2"]} 
                        showJumpControls={true}
                        seekThumbnails={false}
                        logo={false}
                        autoplay={"on-screen"}
                        playsinline={true}
                        fluid={true}
                        /> 
                </div>
                </SwiperSlide>

            </Swiper>
            {/* <CldVideoPlayer src="gn7diews37kbo2ooko7u" width="1280" height="674" className="object-contain"/> */}
            {/* <p>TESTEEEEEEEEEEE</p> */}
        </div>
        </>
    )


}
