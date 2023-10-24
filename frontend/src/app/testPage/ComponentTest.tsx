'use client'

import React from 'react'
import { fetchPosts } from './FetchPosts';

const postsData = fetchPosts()
console.log(postsData)

export const ComponentTest = () => {
    const posts = postsData()
    console.log(posts)
    // await new Promise((resolve)=>setTimeout(resolve, 5000))
    return(
        <>
        <div className="bg-black-200 h-16 flex items-center justify-center">
            <p>ALL THE POSTS ARE LOADED.</p>
        </div>
        <div className="bg-black-200 h-16 flex items-center justify-center">
            <p>{posts?.title}</p>
            <p>{posts?.body}</p>
        </div>
        </>
    )
}