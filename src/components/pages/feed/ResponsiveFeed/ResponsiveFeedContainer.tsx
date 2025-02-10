'use client'

import { useFeedContext } from "@/context/FeedContext";
import InfiniteScrollFallback from "../DesktopFeed/MultUseComponents/InfiniteScroll/InfiniteScrollFallback";
import { UploadCompoent } from "../DesktopFeed/Middle/Upload/UploadComponent";
import FinishFeed from "../DesktopFeed/MultUseComponents/FinishFeed";
import ResponsiveFeed from "./ResponsiveFeed";


const ResponsiveFeedContainer = () => {
    const {hasNextPage, isFetchingNextPage} = useFeedContext()
    
    return (
        <div className="h-full mt-2 pb-8 shadow-lg">
           <UploadCompoent/>
           <ResponsiveFeed />
           {isFetchingNextPage && <InfiniteScrollFallback message={"Estamos carregando mais posts para você"} className="w-5/6 h-24 p-5 mt-[100px]"/>}
           <div className="flex justify-center">
                {!hasNextPage ? <FinishFeed /> : null}
           </div>
        </div>
    )
}
export default ResponsiveFeedContainer;