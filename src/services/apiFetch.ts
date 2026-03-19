import axios from "axios";
import { dispatchTermsNotAccepted } from "@/context/TermsContext";

type TermsNotAcceptedDetail = {
  detail?: string;
  pending_documents?: unknown[];
};

/**
 * Wrapper com a interface "fetch-like" que:
 * - não sobrescreve `window.fetch`;
 * - usa axios internamente para manter consistência;
 * - detecta `403 TERMS_NOT_ACCEPTED` e dispara `dispatchTermsNotAccepted`.
 *
 * Mantém retorno `Response` para não exigir mudanças em todos os services.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = input instanceof URL ? input.toString() : String(input);
  const method = (init?.method ?? "GET").toUpperCase();
  const headers = (init?.headers ?? {}) as any;
  const body = init?.body;

  const withCredentials = init?.credentials === "include";

  try {
    const axiosResp = await axios.request({
      url,
      method: method as any,
      headers,
      data: body,
      withCredentials,
      // não seguir redirects (equivalente ao redirect manual do fetch)
      maxRedirects: 0,
      validateStatus: () => true,
      responseType: "text",
    });

    const contentType = axiosResp.headers?.["content-type"];
    const response = new Response(axiosResp.data ?? "", {
      status: axiosResp.status,
      headers: {
        ...(contentType ? { "content-type": contentType } : {}),
      },
    });

    if (response.status === 403) {
      try {
        const data = (await response.clone().json()) as TermsNotAcceptedDetail;
        if (data?.detail === "TERMS_NOT_ACCEPTED") {
          dispatchTermsNotAccepted({
            pending_documents: (data.pending_documents ?? []) as any[],
          });
        }
      } catch {
        // Ignorar parse errors
      }
    }

    return response;
  } catch (err: any) {
    // Caso axios falhe por rede e não exista response.status, re-throw.
    if (err?.response?.status) {
      const contentType = err.response.headers?.["content-type"];
      const response = new Response(err.response.data ?? "", {
        status: err.response.status,
        headers: {
          ...(contentType ? { "content-type": contentType } : {}),
        },
      });
      return response;
    }
    throw err;
  }
}

