'use client'

import React, { useState } from 'react'
import { fetchPosts } from './FetchPosts';
import Posts from '../../components/pages/feed/DesktopFeed/Middle/PostsComponents/Posts/Posts';
import { useFeedContext } from '../../context/FeedContext';

const postsData = fetchPosts()
console.log(postsData)

export const ComponentTest = () => {
    const { feed = [] } = useFeedContext();
    const [slideIndex, setSlideIndex] = useState(1)
    const posts = postsData()
    console.log(posts)
    // await new Promise((resolve)=>setTimeout(resolve, 5000))
    return(
        <>
        <div className="bg-black-200 h-16 flex items-center justify-center">
            <p>ALL THE POSTS ARE LOADED. dsadsadsa</p>
        </div>
        <div className="bg-black-200 h-16 flex items-center justify-center">
            <p>{posts?.title}</p>
            <p>{posts?.body}</p>
        </div>
        </>
    )
}