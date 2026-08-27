import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy",
  "/community",
  "/cookies",
];
const AUTH_ENTRY_ROUTES = ["/", "/about", "/forgot-password", "/reset-password"];

/** Shared post/cut deep-links and embeds: /feed/{publicId}, /cuts/{publicId}, /cuts/{publicId}/embed. */
function isPublicPostRoute(pathname: string) {
  return /^\/(feed|cuts)\/[A-Za-z0-9]{12}(\/embed)?$/.test(pathname);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasRefreshToken = !!request.cookies.get("refreshToken")?.value;

  const isStaticPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isPublicRoute = isStaticPublicRoute || isPublicPostRoute(pathname);

  // Retorno OAuth Steam: renova JWT no cliente antes de abrir o perfil.
  if (pathname === "/auth/steam/return") {
    return NextResponse.next();
  }

  // Logged-in users on marketing/auth pages go to feed. Legal pages stay permanent.
  if (AUTH_ENTRY_ROUTES.includes(pathname) && hasRefreshToken) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  if (!isPublicRoute && !hasRefreshToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
