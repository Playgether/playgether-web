// useResource.ts
'use client'

import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../../context/AuthContext";

export const useResource = <T>(getResourceFunc: (...props) => void | Promise<T | null | undefined | void>) => {
    const [resources, setResource] = useState<T | undefined | null | void>(undefined);
    const {user, authTokens} = useAuthContext()

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

// export const useResource = <T>(getResourceFunc: (...props) => Promise<T | null | undefined>) => {
//     const [resources, setResource] = useState<T | null | undefined>(null);
//     const { user, authTokens } = useAuthContext();

//     const handleGetApiResource = useCallback(async () => {
//         if (user && authTokens) {
//             const result = await getResourceFunc();
//             setResource(result);
//         } else {
//             setResource(null); 
//         }
//     }, [user, authTokens, getResourceFunc]);

//     useEffect(() => {
//         handleGetApiResource();
//     }, []);

//     return {
//         resources,
//     };
// };

