'use client'

import { AuthProvider } from "./AuthContext"
import { NotificationsContextProvider } from "./NotificationsContext";
import { ProfileContextProvider } from "./ProfileContext";
import {QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const AppProvider = ({ children } : { children: React.ReactNode }) => {

    const queryClient = new QueryClient();

    return (
    <AuthProvider> 
        <QueryClientProvider client={queryClient}>
            <ProfileContextProvider>
                <NotificationsContextProvider>
                        {children}
                </NotificationsContextProvider>
            </ProfileContextProvider>  
        </QueryClientProvider>
    </AuthProvider>
    )
};

