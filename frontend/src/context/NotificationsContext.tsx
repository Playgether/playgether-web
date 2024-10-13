'use client'

import { createContext, useState, useContext} from "react"
import { useAuthContext } from "./AuthContext"
import { useResource } from "../components/custom_hooks/useResource"
import { getNotifications, getNotificationsProps } from "../services/getNotifications"

type NotificationsContextProps = {
    notifications: getNotificationsProps[] | undefined;
}

const NotificationContext = createContext<NotificationsContextProps>({} as NotificationsContextProps)

const NotificationsContextProvider = ({children}: {children: React.ReactNode}) => {
    const {user, authTokens} = useAuthContext()
    const [notifications, setNotifications] = useState<getNotificationsProps[]>();

    async function fetchNotifications(){    
        const response = await getNotifications(authTokens, user?.user_id)
        setNotifications(response)
    }

    useResource<getNotificationsProps>(() => fetchNotifications())

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
