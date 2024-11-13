'use client'

import { Suspense, useEffect, useState } from "react";
import { api } from "../../services/api";


export default async function TestPage() {
    await new Promise((resolve) => setTimeout(resolve, 6000));
    const response = await api.get("https://jsonplaceholder.typicode.com/comments/1")
    const comments = response.data

    return comments
    
}

export const ComponentTest2 = () => {
    const [comments, setComments] = useState()

    
    // const fetchPosts = async () => {
    //     const response = await api.get("https://jsonplaceholder.typicode.com/comments/1");
    //     setComments(response.data)
    //     return new Promise((resolve) => setTimeout(resolve, 10000));
    // }
    const fetchPosts = async () => {
        const data = await TestPage()
        setComments(data)
    }
    fetchPosts()
    //   useEffect(()=> {
    //     fetchPosts()
    //   }, [])
    // await new Promise((resolve)=>setTimeout(resolve, 10000))
    return(
        <>
        <div className="bg-green-200 h-16 flex items-center justify-center text-black-400">
            <p>ALL THE COMMENTS ARE LOADED</p>
        </div>
        <div className="bg-green-200 h-16 flex items-center justify-center text-black-400">
            <p>Título: {comments?.title}</p>
            <p>Comentário: {comments?.body}</p>
        </div>
        </>
    )
}