import React from 'react'
import { api } from '../../services/api';

let status = "pending";
let result;

export function fetchPosts() {
    let fetching = api.get("https://jsonplaceholder.typicode.com/posts/2")
    .then((response)=>{
        status = "fulfilled";
        result = response.data
    })
    .catch((error)=> {
        status = "rejected"
        result = error
    })

    return () => {
        if (status === "pending") {
            throw fetching;
        } else if (status === "rejected") {
            throw result;
        } else if (status === "fulfilled") {
            return result
        }
    }
}