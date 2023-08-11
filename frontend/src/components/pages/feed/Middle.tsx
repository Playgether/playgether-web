'use client'

import { useState } from "react";
import FeedComponent from "./FeedComponent";
import PostComponent from "./PostComponent";
import { IoArrowDownCircleSharp, IoArrowUpCircle } from "react-icons/io5";

const Middle = () => {
    const [isComponentVisible, setComponentVisible] = useState(false);

    const toggleComponentVisibility = () => {
        setComponentVisible(!isComponentVisible);
    };
    
    return (
        <div className="bg-white-300 col-span-2 h-full mt-4 overflow-y-auto pb-14 scrollable">
            <div className="flex flex-row w-full space-x-3 items-center justify-center text-orange-500">
                <div className="text-sm bg-white-300 w-full flex flex-row justify-center items-center space-x-2 pt-1">
                    <h1>{isComponentVisible ? "Fechar" : "Compartilhe algo conosco"}</h1>
                    <button className="" onClick={toggleComponentVisibility}>{isComponentVisible ? <IoArrowUpCircle className="h-8 w-8"/> : <IoArrowDownCircleSharp className="h-8 w-8"/>}</button>
                </div>
            </div>
            {isComponentVisible && <PostComponent />}
                <FeedComponent /> 
        </div>
    )
}

export default Middle