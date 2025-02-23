'use client'

import { Suspense, useState } from "react";
import {  } from "../../context/AuthContext";
import { api } from "../../services/api";
import { PostsCommentsProps } from "../../services/getComments";
import { useFeedContext } from "../../context/FeedContext";
import Posts from "../../components/pages/feed/DesktopFeed/Middle/PostsComponents/Posts/Posts";

let fullfilled = false;
let promise;

const fetchData = async() => {
    const {authTokens} = ()
  if (!fullfilled) {
    if (!promise) {
      promise = await new Promise(async (resolve) => {
        setTimeout(resolve, 5000)
        const res = await api.get<PostsCommentsProps[]>(`/api/v1/posts/1/comments/`, {
            headers: {
                'Authorization':'Bearer ' + String(authTokens?.access)
            }})

        fullfilled = true
        resolve(res.data)
      });
    }

    throw promise
  }
};

const Main = () => {
    const comments = fetchData();
    const { feed = [] } = useFeedContext();
    const [slideIndex, setSlideIndex] = useState(1)
    return (
      <>
        <div className="text-black-400">Loaded</div>
        {/* {feed && feed.map((resource) => (
                <div className="bg-white-200 h-4/6">
                    <Posts media={resource.medias} setSlideIndex={setSlideIndex} postsSize="h-1/2" className="h-5/6"/>
                </div>
            ))}
            <h1>PORRA</h1> */}
      </>
    )
    
  };

const App = () => (
<Suspense fallback={"Loading..."}>
    <Main />
</Suspense>
); 

export default App;