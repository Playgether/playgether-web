'use client'

import { AuthProvider } from "./AuthContext"

export const AppProvider = ({ children } : { children: React.ReactNode }) => {
    return <AuthProvider>{children}</AuthProvider>;
};

