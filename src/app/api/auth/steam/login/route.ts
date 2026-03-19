import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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
  const url = new URL(`${baseUrl}/api/auth/steam/login/`);
  if (next) url.searchParams.set("next", next);

  const resp = await fetch(url.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    redirect: "manual",
    cache: "no-store",
  });

  // Se a conta já estiver conectada, o backend retorna JSON (sem redirect).
  const contentType = resp.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  }

  const location = resp.headers.get("location");
  if (!location) {
    const text = await resp.text();
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: resp.status });
    } catch {
      return NextResponse.json(
        { detail: text || "Missing redirect" },
        { status: 502 }
      );
    }
  }

  const redirectTo = location.startsWith("http") ? location : `${baseUrl}${location}`;
  const nextResp = NextResponse.redirect(redirectTo, 302);

  // Encaminha cookie(s) de sessão do Django para o browser.
  // Isso garante que o social-auth associe no usuário correto (logado via JWT).
  const setCookies =
    // Node/undici costuma expor getSetCookie()
    (resp.headers as any).getSetCookie?.() ??
    (resp.headers.get("set-cookie") ? [resp.headers.get("set-cookie")] : []);

  if (setCookies && setCookies.length > 0) {
    for (const cookie of setCookies) {
      nextResp.headers.append("set-cookie", cookie);
    }
  }

  return nextResp;
}

