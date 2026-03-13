"use client";

import { useEffect } from "react";
import { dispatchTermsNotAccepted } from "@/context/TermsContext";

/**
 * Intercepta respostas fetch para detectar 403 TERMS_NOT_ACCEPTED.
 * Quando detectado, dispara evento que abre o modal de aceite.
 * Deve ser montado uma vez no app (ex: no layout).
 */
export function FetchInterceptor() {
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 403) {
        try {
          const clone = response.clone();
          const data = await clone.json();
          if (data?.detail === "TERMS_NOT_ACCEPTED") {
            dispatchTermsNotAccepted({
              pending_documents: data.pending_documents ?? [],
            });
          }
        } catch {
          // Ignorar erros de parse
        }
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
  return null;
}
