import { Suspense } from "react";
import { LoadingPosts } from "./LoadingPosts";
import { LoadingComments } from "./LoadingComments";
import dynamic from 'next/dynamic';
import { Component2 } from "./Component2";
import Component from "./Component";
import { ComponentTest } from "./ComponentTest";
import { ComponentTest2 } from "./ComponentTest2";
import App from "./Almost1";


export default async function TestPage() {
    return (
        <>
        <Suspense fallback={<LoadingPosts />}>
            <ComponentTest />
        </Suspense>
        <Suspense fallback={<LoadingComments />}>
            <ComponentTest2 />
        </Suspense>
        <App />
        </>
    )

}
