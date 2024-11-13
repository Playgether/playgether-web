'use client'

import { ReactNode, createContext, useState } from "react"

interface toggleFeedContextProps {
    open: boolean
    toggle: () => void
}

export const toggleFeedContext = createContext({} as toggleFeedContextProps)

export function toggleFeedContextProvider({children}: {children: ReactNode}) {
    const [open, setOpen] = useState(false)

    function toggle() {
        setOpen(state => !state)
    }

    return(
        <toggleFeedContext.Provider value={{open, toggle}}>
            {children}
        </toggleFeedContext.Provider>
    )
}