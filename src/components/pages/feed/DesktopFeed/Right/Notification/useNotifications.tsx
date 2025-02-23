'use client'

import { useCallback, useEffect, useState } from "react";
import { getNotifications, getNotificationsProps } from "../../../../../../services/getNotifications";
import {  } from "../../../../../../context/AuthContext";


export const useNotifications = () => {
    const [notifications, setNotifications] = useState<getNotificationsProps[]>([]);
    const { authTokens, user } = ();

    const handleFetchNotifications = useCallback(async () => {
        if (authTokens) {
            const response = await getNotifications(authTokens, user);
            setNotifications(response);
        } 
    }, []);

    useEffect(() => {
        handleFetchNotifications();
    }, [handleFetchNotifications]);

    return {
        notifications, authTokens
    };
};