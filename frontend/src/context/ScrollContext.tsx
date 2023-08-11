'use client'

import { ReactNode, createContext, useContext, useState } from "react"

interface toggleFeedContextProps {
    scrollValue: number
    handleScroll: (event) => void
}

export const ScrollContext = createContext({} as toggleFeedContextProps)

export function ScrollContextProvider({children}: {children: ReactNode}) {
    const [scrollValue, setScrollValue] = useState(0);

    const handleScroll = (event) => {
        const { scrollTop } = event.target;
    
        setScrollValue(scrollTop);
      };

    return(
        <ScrollContext.Provider value={{scrollValue, handleScroll}}>
            {children}
        </ScrollContext.Provider>
    )
}

export const useScrollContext = () => useContext(ScrollContext);
