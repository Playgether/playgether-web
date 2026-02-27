'use client'

import { Suspense, useEffect, useState } from "react";
import { api } from "../../services/api";
import { LoadingComments } from "./LoadingComments";

export const Component2 = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //   setTimeout(()=> {
    //     const fetchPosts = async () => {
    //       try {
    //         const response = await api.get("https://jsonplaceholder.typicode.com/comments/1");
    //         setPosts(response.data);
    //         setLoading(false)
    //       } catch (error) {
    //         console.error(error);
    //       }
    //     };
    //     fetchPosts();
    //   }, 10000)
    //   }, []);

    useEffect(()=> {
      const fetchPosts = () => {
        return new Promise((resolve, reject) => {
          setTimeout(async()=> {
            const response = await api.get("https://jsonplaceholder.typicode.com/comments/1");
            setPosts(response.data);
            setLoading(false)
            resolve
          }, 5000)
        })
      }
      fetchPosts()
    }, [])

    return (
      

        <div className="w-full">
            <p className="w-full bg-green-200 text-black-200">DADOS CARREGADOS</p>
            <p className="text-3xl bg-black-200">Comments</p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-black-200">
                {posts.length > 0 ? (
                    posts.map((post)=> (
                        <div key={post.postId} className="bg-blue-400">
                            <li>{post.name}</li>
                            <br></br>
                            <li>{post.body}</li>
                        </div>
                    ))
                ):null}
                <p>CERTO</p>
            </ul>
        </div>
      
    )
}