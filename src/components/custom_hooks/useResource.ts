// useResource.ts
'use client'

import { useState, useEffect, useCallback } from "react";
import {  } from "../../context/AuthContext";

export const useResource = <T>(getResourceFunc: (...props) => void | Promise<T | null | undefined | void>) => {
    const [resources, setResource] = useState<T | undefined | null | void>(undefined);
    const {user, authTokens} = ()

    const handleGetApiResource = useCallback(async () => {
        if (user && authTokens && !resources) {
            const result = await getResourceFunc();
            setResource(result);
        } else {
            false
        }

    }, [user, authTokens, getResourceFunc, resources])

    useEffect(() => {
        handleGetApiResource();         
    }, []);

    return {
        resources
    };
};
