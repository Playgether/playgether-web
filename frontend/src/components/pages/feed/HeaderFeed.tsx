import React from "react";
import ImageComponent from "../../elements/ImageComponent";
import SearchElement from "./SearchElementHeader";
import IconsHeader from "./IconsHeader";

const HeaderFeed = ({}) => {
    return (
        <div className="w-full bg-blue-300 h-14 flex flex-row space-x-16">
            <div className="w-32 h-full ml-6 ">
                <div className="w-full h-full flex items-center justify-center">
                    <ImageComponent src={"/index/logoName.png"} layout="responsive" width={0} height={0} alt={"logo com o nome"}/>
                </div>
            </div>
            <SearchElement/>
            <IconsHeader />
        </div>
    );
}

export default HeaderFeed