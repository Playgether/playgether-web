'use client'

import { createContext, useState, useContext} from "react"
import { getProfile } from "../services/getProfile"
import { useAuthContext } from "./AuthContext"
import { ProfileProps } from "../services/getProfile"
import { useResource } from "../components/custom_hooks/useResource"

type ProfileContextProps = {
    profile: ProfileProps | null | void;
    fetchProfile: () => void
}

const ProfileContext = createContext<ProfileContextProps>({} as ProfileContextProps)

const ProfileContextProvider = ({children}: {children: React.ReactNode}) => {
    const {user, authTokens} = useAuthContext()
    const [profile, setProfile] = useState<ProfileProps | void | null | undefined>();

    async function fetchProfile(){    
        const response = await getProfile(authTokens, user?.user_id)
        setProfile(response.data)
    }

    useResource<ProfileProps>(() => fetchProfile())

    return(
        <ProfileContext.Provider value={{profile, fetchProfile}}>
            {children}
        </ProfileContext.Provider>
    )
}

const useProfileContext = () => {
    const context = useContext(ProfileContext);
    return context
}

export {ProfileContextProvider, useProfileContext, ProfileContext}
