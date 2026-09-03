import axios from "axios";
import { dispatchTermsNotAccepted } from "@/context/TermsContext";
import { refreshTokenServer } from "@/actions/refreshToken";
import { logoutServer } from "@/actions/logout";

type TermsNotAcceptedDetail = {
  detail?: string;
  pending_documents?: unknown[];
};

/** Uma única renovação em voo quando vários 401 chegam juntos. */
let refreshInFlight: Promise<boolean> | null = null;

function dedupedRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = refreshTokenServer()
      .then((ok) => ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function handleSessionExpiredOnClient(): Promise<void> {
  await logoutServer();
  try {
    localStorage.removeItem("user");
  } catch {
    // ignore
  }
  window.location.href = "/";
}

/** Status codes that must not include a body (Fetch `Response` constructor). */
const NULL_BODY_STATUSES = new Set([101, 103, 204, 205, 304]);

function responseFromAxios(status: number, data: unknown, contentType?: string) {
  const body = NULL_BODY_STATUSES.has(status) ? null : ((data as BodyInit | null | undefined) ?? "");
  return new Response(body, {
    status,
    headers: {
      ...(contentType && body !== null ? { "content-type": contentType } : {}),
    },
  });
}

/**
 * Wrapper com a interface "fetch-like" que:
 * - não sobrescreve `window.fetch`;
 * - usa axios internamente para manter consistência;
 * - detecta `403 TERMS_NOT_ACCEPTED` e dispara `dispatchTermsNotAccepted`;
 * - em `401` no browser (com `credentials: "include"`): tenta renovar o access uma vez;
 *   se a renovação falhar, encerra sessão e manda para a home.
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

  const runAxios = () =>
    axios.request({
      url,
      method: method as any,
      headers,
      data: body,
      withCredentials,
      maxRedirects: 0,
      timeout: 30000,
      validateStatus: () => true,
      responseType: "text",
    });

  try {
    let axiosResp = await runAxios();

    const canTryRefresh =
      typeof window !== "undefined" &&
      withCredentials &&
      axiosResp.status === 401;

    if (canTryRefresh) {
      const renewed = await dedupedRefresh();
      if (renewed) {
        axiosResp = await runAxios();
      } else {
        await handleSessionExpiredOnClient();
        return new Response("", { status: 401, statusText: "Unauthorized" });
      }
    }

    const response = responseFromAxios(
      axiosResp.status,
      axiosResp.data,
      axiosResp.headers?.["content-type"]
    );

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
    if (err?.response?.status) {
      return responseFromAxios(
        err.response.status,
        err.response.data,
        err.response.headers?.["content-type"]
      );
    }
    throw err;
  }
}
