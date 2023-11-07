'use client'

import { useState } from "react";
import PostComponent from "./PostComponent";
import { IoArrowDownCircleSharp, IoArrowUpCircle } from "react-icons/io5";
import {medias}  from "../../../app/page/page";
import LoadMore from "./LoadMore";
import Posts from "./Posts";
import FeedComponent from "./FeedComponent";

const Middle = () => {
    const [isComponentVisible, setComponentVisible] = useState(false);

    const toggleComponentVisibility = () => {
        setComponentVisible(!isComponentVisible);
    };
     
    return (
        <div className="bg-white-300 col-span-2 h-full w-full mt-4 overflow-y-auto pb-14 scrollable shadow-lg">
            <div className="flex flex-row w-full space-x-3 items-center justify-center text-orange-500">
                <div className="text-sm bg-white-300 w-full flex flex-row justify-center items-center space-x-2 pt-1">
                    <h1>{isComponentVisible ? "Fechar" : "Compartilhe algo conosco"}</h1>
                    <button className="" onClick={toggleComponentVisibility}>{isComponentVisible ? <IoArrowUpCircle className="pt-1 h-8 w-8 animate-bounce"/> : <IoArrowDownCircleSharp className="pt-1 animate-bounce h-8 w-8"/>}</button>
                </div>
            </div>
            {isComponentVisible && <PostComponent />}
           <FeedComponent />
            <LoadMore />
        </div>
    )
}
<Posts media={medias}/>

export default Middle;