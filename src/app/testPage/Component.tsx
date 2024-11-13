
'use client'

import { Suspense, useEffect, useState } from "react";
import { api } from "../../services/api";
import { LoadingPosts } from "./LoadingPosts";
import { LoadingComponent } from "../../components/layouts/components/LoadingComponent";
import { useResource } from "../../components/custom_hooks/useResource";

export default async function Component () {
    await new Promise((resolve)=>setTimeout(resolve, 4000))
    return (
        <div className="w-full">
            <p className="w-full bg-green-200 text-black-200">DADOS CARREGADOS</p>
            <p className="text-3xl bg-black-200">Posts</p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-black-200">
                {/* {posts.length > 0 ? (
                    posts.map((post)=> ( */}
                    {/* <div key={posts.userId} className="bg-blue-400">
                        <li>{posts.title}</li>
                        <br></br>
                        <li>{posts.body}</li>
                    </div> */}
                    <p>CERTO</p>
                {/* ))
                ):null} */}
            </ul>
        </div>
    )
}