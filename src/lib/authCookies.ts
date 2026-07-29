/** Refresh cookie / sessão “ficar logado” — alinhado ao SIMPLE_JWT do backend. */
export const REFRESH_TOKEN_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 dias

export const AUTH_COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function accessTokenMaxAgeSec(exp?: number): number {
  if (exp) return Math.max(Math.floor(exp - Date.now() / 1000), 1);
  return 3600;
}

/** Rejeita cookie ausente ou o literal "undefined" (bug de template string). */
export function isValidUserId(value: string | undefined | null): value is string {
  return !!value && value !== "undefined" && value !== "null";
}
