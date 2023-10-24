'use client'

import { Suspense } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { api } from "../../services/api";
import { PostsCommentsProps } from "../../services/getComments";

let fullfilled = false;
let promise;

const fetchData = async() => {
    const {authTokens} = useAuthContext()
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
    return <div className="text-black-400">Loaded</div>;
  };

const App = () => (
<Suspense fallback={"Loading..."}>
    <Main />
</Suspense>
); 

export default App;