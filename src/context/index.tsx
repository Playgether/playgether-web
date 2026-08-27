'use client'

import { useState } from "react";
import { AuthProvider } from "./AuthContext"
import { UserPreferencesProvider } from "./UserPreferencesContext"
import { PresenceProvider } from "./PresenceContext";
import { NotificationsContextProvider } from "./NotificationsContext";
import { ProfileContextProvider } from "./ProfileContext";
import { CreatePostProvider } from "./CreatePostContext";
import { TermsProvider } from "./TermsContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TermsAcceptanceModal } from "@/components/terms/TermsAcceptanceModal";
import { AxiosTermsInterceptor } from "@/components/terms/AxiosTermsInterceptor";
import { CookieConsentBanner } from "@/components/cookies/CookieConsentBanner";

export const AppProvider = ({ children } : { children: React.ReactNode }) => {
    // Stable across re-renders (ThemeProvider hydrate, etc.) — recreating
    // QueryClient wiped in-flight feed/widget queries and left spinners stuck.
    const [queryClient] = useState(
      () =>
        new QueryClient({
          defaultOptions: {
            queries: {
              refetchOnWindowFocus: false,
              retry: 1,
            },
          },
        }),
    );

    return (
    <AuthProvider>
        <UserPreferencesProvider>
        <PresenceProvider>
        <TermsProvider>
            <AxiosTermsInterceptor />
            <TermsAcceptanceModal />
            <CookieConsentBanner />
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
        </PresenceProvider>
        </UserPreferencesProvider>
    </AuthProvider>
    )
};

