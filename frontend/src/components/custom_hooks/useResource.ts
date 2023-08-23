// useResource.ts
import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../../context/AuthContext";

export const useResource = <T>(getResourceFunc: (...props) => void | Promise<T | null | undefined | void>) => {
    const [resource, setResource] = useState<T | undefined | null | void>(undefined);
    const {user, authTokens} = useAuthContext()

    const handleGetApiResource = useCallback(async () => {
        if (user && authTokens) {
            const result = await getResourceFunc();
            setResource(result);
        } else {
            false
        }

    }, [user, authTokens, getResourceFunc])

    useEffect(() => {
        handleGetApiResource();         
    }, []);

    return {
        resource
    };
};


