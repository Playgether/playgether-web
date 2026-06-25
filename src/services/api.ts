import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Interceptor server-side: em 401 tenta renovar o access token e retenta a chamada uma vez.
// Só roda fora do browser (rotas proxy Next.js / server actions).
// Não se aplica a chamadas ao próprio endpoint de refresh (evita loop infinito).
if (typeof window === "undefined") {
  let refreshInFlight: Promise<{ ok: boolean; access?: string }> | null = null;

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const url: string = error.config?.url ?? "";
      const alreadyRetried: boolean = error.config?._retried ?? false;
      const isRefreshEndpoint = url.includes("/token/refresh/") || url.includes("/token/");

      if (error.response?.status !== 401 || alreadyRetried || isRefreshEndpoint) {
        return Promise.reject(error);
      }

      // Marca como retentado antes de qualquer await para evitar re-entrada
      error.config._retried = true;

      // Dedup: se já tem um refresh em voo, aguarda o mesmo
      if (!refreshInFlight) {
        refreshInFlight = import("@/actions/refreshToken")
          .then(({ refreshCookiesFromRefreshToken }) => refreshCookiesFromRefreshToken())
          .catch(() => ({ ok: false as const }))
          .finally(() => {
            refreshInFlight = null;
          });
      }

      const result = await refreshInFlight;
      if (result.ok && result.access) {
        error.config.headers = {
          ...error.config.headers,
          Authorization: `Bearer ${result.access}`,
        };
        return api.request(error.config);
      }

      return Promise.reject(error);
    }
  );
}
