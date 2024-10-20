'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";
import { FeedProps, getFeed } from "../services/getFeed";
import { useProfileContext } from "./ProfileContext";

type FeedContextProps = {
    feed: FeedProps[] | null | void | undefined;
    alterCommentQuantity: (post_id: number) => void;
    subtractCommentQuantity: (post_id: number) => void;
}

const FeedContext = createContext<FeedContextProps>({} as FeedContextProps)

const FeedContextProvider = ({children}: {children: React.ReactNode}) => {
    const {authTokens} = useAuthContext()
    const {profile} = useProfileContext()
    const [feed, setFeed] = useState<FeedProps[] | void | null | undefined>();

    const alterCommentQuantity = (post_id: number) => {
        if (!feed) return; 
    
        const postIndex = feed.findIndex(post => post.id === post_id);
    
        if (postIndex !== -1) {
            const updatedFeed = [...feed];
            const post = { ...updatedFeed[postIndex] };
            post.quantity_comment += 1;
            updatedFeed[postIndex] = post;
    
            setFeed(updatedFeed); 
        }
    };

    const subtractCommentQuantity = (post_id: number) => {
        if (!feed) return; 
    
        const postIndex = feed.findIndex(post => post.id === post_id);
    
        if (postIndex !== -1) {
            const updatedFeed = [...feed];
            const post = { ...updatedFeed[postIndex] };
            post.quantity_comment -= 1;
            updatedFeed[postIndex] = post;
    
            setFeed(updatedFeed); 
        }
    };

    const fetchData = async () => {
        try {
            const response = await getFeed(authTokens, profile?.id);
            setFeed(response.data);
        } catch (error) {
            console.error("Erro ao buscar conteúdo:", error);
        }
    };

    useEffect(()=> {
        if (!feed && authTokens && profile?.id){
            fetchData();
        }
    }, [profile]);


    return(
        <FeedContext.Provider value={{feed, alterCommentQuantity, subtractCommentQuantity}}>
            {children}
        </FeedContext.Provider>
        
    )
}

export const useFeedContext = () => useContext(FeedContext) 
export {FeedContextProvider}



