import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.baseUrl;
  if (!baseUrl) {
    return NextResponse.json({ detail: "Missing baseUrl" }, { status: 500 });
  }

  // A API pode paginar; tentamos pegar bastante jogos para a biblioteca.
  const resp = await fetch(`${baseUrl}/api/v1/games/?page_size=50`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  const text = await resp.text();
  const json = (() => {
    try {
      return JSON.parse(text);
    } catch {
      return { detail: text };
    }
  })();

  // CursorPagination: normalmente vem { results: [...] }
  const results = Array.isArray(json) ? json : json?.results ?? [];
  return NextResponse.json(results, { status: resp.status });
}

