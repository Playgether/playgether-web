'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";
import { FeedProps, getFeed } from "../services/getFeed";
import { useProfileContext } from "./ProfileContext";

type FeedContextProps = {
    feed: FeedProps[] | null | void | undefined;
}

const FeedContext = createContext<FeedContextProps>({} as FeedContextProps)

const FeedContextProvider = ({children}: {children: React.ReactNode}) => {
    const {authTokens} = useAuthContext()
    const {profile, fetchProfile} = useProfileContext()
    const [feed, setFeed] = useState<FeedProps[] | void | null | undefined>();

    const fetchData = async () => {
        try {
            await fetchProfile()
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
    }, [authTokens, profile?.id]);


    return(
        <FeedContext.Provider value={{feed}}>
            {children}
        </FeedContext.Provider>
        
    )
}

export const useFeedContext = () => useContext(FeedContext) 
export {FeedContextProvider}



