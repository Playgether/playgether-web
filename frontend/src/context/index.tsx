'use client'

import { AuthProvider } from "./AuthContext"
import { ProfileContextProvider } from "./ProfileContext";

export const AppProvider = ({ children } : { children: React.ReactNode }) => {
    return (
    <AuthProvider> 
        <ProfileContextProvider>
            {children}
        </ProfileContextProvider>  
    </AuthProvider>
    )
};

