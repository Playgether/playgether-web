'use client'

import { AuthProvider } from "./AuthContext"
import { NotificationsContextProvider } from "./NotificationsContext";
import { ProfileContextProvider } from "./ProfileContext";
import { CreatePostProvider } from "./CreatePostContext";
import { TermsProvider } from "./TermsContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TermsAcceptanceModal } from "@/components/terms/TermsAcceptanceModal";
import { FetchInterceptor } from "@/components/terms/FetchInterceptor";

export const AppProvider = ({ children } : { children: React.ReactNode }) => {

    const queryClient = new QueryClient();

    return (
    <AuthProvider>
        <TermsProvider>
            <FetchInterceptor />
            <TermsAcceptanceModal />
            <QueryClientProvider client={queryClient}>
                <ProfileContextProvider>
                    <NotificationsContextProvider>
                        <CreatePostProvider>
                            {children}
                        </CreatePostProvider>
                    </NotificationsContextProvider>
                </ProfileContextProvider>
            </QueryClientProvider>
        </TermsProvider>
    </AuthProvider>
    )
};

