// useResource.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../../context/AuthContext";

export const useResource = <T>(
  getResourceFunc: (...props) => void | Promise<T | null | undefined | void>
) => {
  const [resources, setResource] = useState<T | undefined | null | void>(
    undefined
  );
  const { user } = useAuthContext();

  const handleGetApiResource = useCallback(async () => {
    if (user && !resources) {
      const result = await getResourceFunc();
      setResource(result);
    } else {
      false;
    }
  }, [user, getResourceFunc, resources]);

  useEffect(() => {
    handleGetApiResource();
  }, []);

  return {
    resources,
  };
};
