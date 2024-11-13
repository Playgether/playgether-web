'use client'

import { AuthProvider } from "./AuthContext"
import { NotificationsContextProvider } from "./NotificationsContext";
import { ProfileContextProvider } from "./ProfileContext";

export const AppProvider = ({ children } : { children: React.ReactNode }) => {
    return (
    <AuthProvider> 
        <ProfileContextProvider>
            <NotificationsContextProvider>
                {children}
            </NotificationsContextProvider>
        </ProfileContextProvider>  
    </AuthProvider>
    )
};

