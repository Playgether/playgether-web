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
    const {profile} = useProfileContext()
    const [feed, setFeed] = useState<FeedProps[] | void | null | undefined>();


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getFeed(authTokens, profile?.id);
                setFeed(response.data);
            } catch (error) {
                console.error("Erro ao buscar conteúdo:", error);
            }
        };

        fetchData();
    }, [authTokens, profile]);



    return(
        <FeedContext.Provider value={{feed}}>
            {children}
        </FeedContext.Provider>
        
    )
}

export const useFeedContext = () => useContext(FeedContext) 
export {FeedContextProvider}



