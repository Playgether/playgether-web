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


export default async function TestPage() {
    const { feed = [] } = useFeedContext();
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
        <h1 className="text-blue-500">TESTE</h1>
        <div className="bg-red-300 h-80">
            <Posts media={medias} setSlideIndex={setSlideIndex} className="h-5/6"/>
        </div>
        </>
    )


}
