import React from "react";
import Button from "../../elements/Button";
import { SiValorant, SiCounterstrike } from "react-icons/si";
import ImageComponent from "../../elements/ImageComponent";
import {MdSearch} from "react-icons/md";
import AsideFeed from "./AsideFeed";
import ProfileCard from "./ProfileCard";
import OnlineFriendsCard from "./OnlineFriendsCard";

const ContentFeed = ({}) => {
    return (
        <div className="flex-1 grid grid-cols-4 gap-2">
            <div>
                <div className="flex flex-row h-full pt-2 pl-4 space-x-2">
                    <AsideFeed />
                    <div className="bg-white-300 flex-1 h-5/6 flex flex-col space-y-4">
                        <ProfileCard />
                        <OnlineFriendsCard />
                    </div>
                </div>

            </div>
            <div className="bg-yellow-200 col-span-2 overflow-y-scroll">

            </div>
            <div className="bg-green-200">

            </div>


        </div>
    );
};

export default ContentFeed;