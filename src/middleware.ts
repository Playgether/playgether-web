import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/about", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasRefreshToken = !!request.cookies.get("refreshToken")?.value;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Retorno OAuth Steam: renova JWT no cliente antes de abrir o perfil.
  if (pathname === "/auth/steam/return") {
    return NextResponse.next();
  }

  if (isPublicRoute && hasRefreshToken) {
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
