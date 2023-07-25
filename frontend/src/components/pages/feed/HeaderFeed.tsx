import React from "react";
import SearchElement from "./SearchElementHeader";
import IconsHeader from "./IconsHeader";
import Image from "next/legacy/image";

const HeaderFeed = ({}) => {
    return (
        <div className="w-full bg-blue-300 h-14 flex flex-row space-x-16">
            <div className="w-32 h-full ml-6 ">
                <div className="relative w-full h-full flex items-center justify-center">
                    <Image src={"/index/logoName.png"} layout="fill" objectFit="contain" width={0} height={0} alt={"logo com o nome"}/>
                </div>
            </div>
            <SearchElement/>
            <IconsHeader />
        </div>
    );
}

export default HeaderFeed