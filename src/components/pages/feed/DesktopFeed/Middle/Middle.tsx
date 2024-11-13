'use client'

import FeedComponent from "./FeedComponent";
import LoadMore from "../MultUseComponents/LoadMore";
import { UploadCompoent } from "./Upload/UploadComponent";

const Middle = () => {
    
    return (
        <div className="h-full mt-4 pb-14 scrollable shadow-lg">
            <UploadCompoent/>
           <FeedComponent />
           <LoadMore />
        </div>
    )
}
export default Middle;