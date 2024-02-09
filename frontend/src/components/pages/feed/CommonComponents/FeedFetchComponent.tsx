'use client'

import ContentFeed from "../DesktopFeed/MultUseComponents/ContentFeed"
import { ResponsiveContainer } from "../ResponsiveFeed/Container"

export const FeedFetchComponent = async () => {

    return (
        <>
            <div className='hidden lg:flex flex-col h-full w-full'>
                <ContentFeed />
            </div> 
            <div className='lg:hidden h-full w-full'>
                <ResponsiveContainer />
            </div> 
        </>
    )
}