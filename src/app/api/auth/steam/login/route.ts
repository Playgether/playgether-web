import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next");
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.baseUrl;
  if (!baseUrl) {
    return NextResponse.json({ detail: "Missing baseUrl" }, { status: 500 });
  }

  // Encaminha o parâmetro `next` (se existir) para o backend,
  // para ele devolver o usuário na página correta em caso de sucesso/erro.
  const axiosResp = await api.get(`/api/auth/steam/login/`, {
    params: next ? { next } : undefined,
    headers: { Authorization: `Bearer ${accessToken}` },
    maxRedirects: 0,
    validateStatus: () => true,
    responseType: "text",
  });

  // Se a conta já estiver conectada, o backend retorna JSON (sem redirect).
  const contentType = axiosResp.headers?.["content-type"] || "";
  if (contentType.includes("application/json")) {
    const json = (() => {
      try {
        return JSON.parse(axiosResp.data ?? "null");
      } catch {
        return { detail: axiosResp.data ?? "" };
      }
    })();
    return NextResponse.json(json, { status: axiosResp.status });
  }

  const location = axiosResp.headers?.["location"];
  if (!location) {
    const text = axiosResp.data ?? "";
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: axiosResp.status });
    } catch {
      return NextResponse.json(
        { detail: text || "Missing redirect" },
        { status: 502 }
      );
    }
  }

  const redirectTo = location.startsWith("http") ? location : `${baseUrl}${location}`;
  const nextResp = NextResponse.redirect(redirectTo, 302);

  let steamErrorInRedirect: string | null = null;
  try {
    const redirectUrl = new URL(redirectTo);
    steamErrorInRedirect = redirectUrl.searchParams.get("steam_error");
    if (steamErrorInRedirect) {
      nextResp.cookies.set("steam_error_toast", steamErrorInRedirect, {
        path: "/",
        maxAge: 180,
        sameSite: "lax",
      });
    }
  } catch {
    /* ignora */
  }

  const setCookiesHeader = axiosResp.headers?.["set-cookie"];
  const setCookies = Array.isArray(setCookiesHeader)
    ? setCookiesHeader
    : setCookiesHeader
      ? [setCookiesHeader]
      : [];
  for (const cookie of setCookies) {
    if (steamErrorInRedirect && String(cookie).toLowerCase().includes("steam_error_toast")) continue;
    nextResp.headers.append("set-cookie", cookie);
  }

  return nextResp;
}

