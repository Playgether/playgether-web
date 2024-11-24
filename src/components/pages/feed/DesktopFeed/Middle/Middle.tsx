'use client'

import FeedComponent from "./FeedComponent";
import FinishFeed from "../MultUseComponents/FinishFeed";
import { UploadCompoent } from "./Upload/UploadComponent";
import { useFeedContext } from "@/context/FeedContext";

const Middle = () => {
    const {hasNextPage} = useFeedContext()
    
    return (
        <div className="h-full mt-4 pb-14 scrollable shadow-lg">
           <UploadCompoent/>
           <FeedComponent />
           {!hasNextPage ? <FinishFeed /> : null}
        </div>
    )
}
export default Middle;