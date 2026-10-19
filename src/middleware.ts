import { NextRequest, NextResponse } from "next/server";
import { AUTH_ENTRY_ROUTES, isPublicRoute } from "@/lib/authRoutes";
import {
  AUTH_COOKIE_BASE,
  REFRESH_TOKEN_MAX_AGE_SEC,
  accessTokenMaxAgeSec,
} from "@/lib/authCookies";

const AUTH_COOKIE_NAMES = ["accessToken", "refreshToken", "user_id"] as const;
/** Renova um pouco antes de expirar para o access não vencer no meio do render. */
const ACCESS_EXPIRY_SKEW_SEC = 60;
const REFRESH_TIMEOUT_MS = 8000;

type JwtPayload = { exp?: number; user_id?: string | number };

type RefreshResult =
  | { status: "ok"; access: string; refresh: string | null; payload: JwtPayload }
  | { status: "invalid" }
  | { status: "unavailable" };

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

function isAccessTokenFresh(token: string | undefined): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload || payload.user_id == null) return false;
  if (!payload.exp) return true;
  return payload.exp - ACCESS_EXPIRY_SKEW_SEC > Date.now() / 1000;
}

async function refreshAtBackend(refreshToken: string): Promise<RefreshResult> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
    });
    if (res.status === 400 || res.status === 401) return { status: "invalid" };
    if (!res.ok) return { status: "unavailable" };

    const data = (await res.json()) as { access?: string; refresh?: string };
    const payload = data.access ? decodeJwtPayload(data.access) : null;
    if (!data.access || !payload || payload.user_id == null) return { status: "invalid" };
    return { status: "ok", access: data.access, refresh: data.refresh ?? null, payload };
  } catch {
    return { status: "unavailable" };
  }
}

function redirectTo(request: NextRequest, pathname: string) {
  return NextResponse.redirect(new URL(pathname, request.url));
}

function clearAuthCookies(response: NextResponse) {
  for (const name of AUTH_COOKIE_NAMES) response.cookies.delete(name);
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retorno OAuth Steam: renova JWT no cliente antes de abrir o perfil.
  if (pathname === "/auth/steam/return") {
    return NextResponse.next();
  }

  const isPublic = isPublicRoute(pathname);
  const isAuthEntry = AUTH_ENTRY_ROUTES.includes(pathname);
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!refreshToken) {
    if (isPublic) return NextResponse.next();
    return clearAuthCookies(redirectTo(request, "/"));
  }

  if (isAccessTokenFresh(accessToken)) {
    return isAuthEntry ? redirectTo(request, "/feed") : NextResponse.next();
  }

  // Access ausente/expirado: renova aqui (único lugar onde dá para gravar cookies
  // antes dos Server Components rodarem) e repassa os tokens novos para o render.
  const result = await refreshAtBackend(refreshToken);

  if (result.status === "invalid") {
    return clearAuthCookies(isPublic ? NextResponse.next() : redirectTo(request, "/"));
  }

  if (result.status === "unavailable") {
    // Backend fora: não derruba a sessão, mas também não deixa entrar em rota protegida.
    return isPublic ? NextResponse.next() : redirectTo(request, "/");
  }

  const newRefresh = result.refresh ?? refreshToken;
  const userId = String(result.payload.user_id);

  request.cookies.set("accessToken", result.access);
  request.cookies.set("refreshToken", newRefresh);
  request.cookies.set("user_id", userId);

  const response = isAuthEntry
    ? redirectTo(request, "/feed")
    : NextResponse.next({ request: { headers: request.headers } });

  response.cookies.set("accessToken", result.access, {
    ...AUTH_COOKIE_BASE,
    maxAge: accessTokenMaxAgeSec(result.payload.exp),
  });
  response.cookies.set("refreshToken", newRefresh, {
    ...AUTH_COOKIE_BASE,
    maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
  });
  response.cookies.set("user_id", userId, {
    ...AUTH_COOKIE_BASE,
    maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|riot\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov|ogg|mp3|wav|ico)$).*)",
  ],
};
