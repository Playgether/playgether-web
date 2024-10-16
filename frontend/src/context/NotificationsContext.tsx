'use client'

import { createContext, useState, useContext, useEffect} from "react"
import { useAuthContext } from "./AuthContext"
import { getNotifications, getNotificationsProps } from "../services/getNotifications"
import { useProfileContext } from "./ProfileContext"

type NotificationsContextProps = {
    notifications: getNotificationsProps[] | undefined;
}

const NotificationContext = createContext<NotificationsContextProps>({} as NotificationsContextProps)

const NotificationsContextProvider = ({children}: {children: React.ReactNode}) => {
    const {user, authTokens} = useAuthContext()
    const [notifications, setNotifications] = useState<getNotificationsProps[]>();
    const {profile, fetchProfile} = useProfileContext()

    async function fetchNotifications(){   
        try {
            await fetchProfile()
            const response = await getNotifications(authTokens, user?.user_id)
            setNotifications(response)
        } catch (err){
            console.error("Erro ao buscar conteúdo", err)
        }
    }

    useEffect(()=> {
        if (!notifications && authTokens && profile?.id){
            fetchNotifications()
        }
    }, [authTokens, profile?.id])

    return(
        <NotificationContext.Provider value={{notifications}}>
            {children}
        </NotificationContext.Provider>
    )
}

const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    return context
}

export {NotificationsContextProvider, useNotificationContext, NotificationContext}
