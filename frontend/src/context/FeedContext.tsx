'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";
import { FeedProps, getFeed } from "../services/getFeed";

type FeedContextProps = {
    feed: FeedProps[] | null | void | undefined;
}

const FeedContext = createContext<FeedContextProps>({} as FeedContextProps)

const FeedContextProvider = ({children}: {children: React.ReactNode}) => {
    const {user, authTokens} = useAuthContext()
    const [feed, setFeed] = useState<FeedProps[] | void | null | undefined>();


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getFeed(authTokens, user?.user_id);
                setFeed(response.data);
            } catch (error) {
                console.error("Erro ao buscar conteúdo:", error);
            }
        };

        fetchData();
    }, [authTokens, user]);



    return(
        <FeedContext.Provider value={{feed}}>
            {children}
        </FeedContext.Provider>
        
    )
}

export const useFeedContext = () => useContext(FeedContext) 
export {FeedContextProvider}



