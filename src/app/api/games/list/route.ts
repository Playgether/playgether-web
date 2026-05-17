import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export async function GET() {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  // A API pode paginar; tentamos pegar bastante jogos para a biblioteca.
  const axiosResp = await api.get(`/api/v1/games/`, {
    params: { page_size: 50 },
    headers: { Authorization: `Bearer ${accessToken}` },
    validateStatus: () => true,
    responseType: "text",
  });

  const text = axiosResp.data ?? "";
  const json = (() => {
    try {
      return JSON.parse(text);
    } catch {
      return { detail: text };
    }
  })();

  // CursorPagination: normalmente vem { results: [...] }
  const results = Array.isArray(json) ? json : json?.results ?? [];
  return NextResponse.json(results, { status: axiosResp.status });
}

