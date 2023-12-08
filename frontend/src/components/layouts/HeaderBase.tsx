import React from "react";
import SearchElement from "../pages/feed/SearchElementHeader";
import IconsHeader from "./IconsHeader";
import Image from "next/legacy/image";
import { ItemsHeader } from "./HeaderItems";

const HeaderBase = ({}) => {
    return (
        <>
        <div className="w-full bg-blue-300 h-14 flex flex-row lg:space-x-16">
            <div className="lg:w-32 w-20 h-full ml-6 ">
                <div className="relative w-4/6 lg:w-full h-full flex items-center justify-center">
                    <Image src={"/index/logoName.png"} layout="fill" objectFit="contain" width={0} height={0} alt={"logo com o nome"}/>
                </div>
            </div>

            <SearchElement/>
            <IconsHeader />

        </div>
        </>
    );
}

export default HeaderBase