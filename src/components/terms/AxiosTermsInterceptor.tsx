"use client";

import { useEffect } from "react";
import { api } from "@/services/api";
import { dispatchTermsNotAccepted } from "@/context/TermsContext";

/**
 * Interceptor seguro (sem sobrescrever `window.fetch`) para capturar
 * respostas 403 com `detail: "TERMS_NOT_ACCEPTED"` vindas de requests via axios.
 */
export function AxiosTermsInterceptor() {
  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        const data = error?.response?.data;

        if (status === 403 && data?.detail === "TERMS_NOT_ACCEPTED") {
          dispatchTermsNotAccepted({
            pending_documents: data?.pending_documents ?? [],
          });
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, []);

  return null;
}

