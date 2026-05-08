import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

/**
 * Inicia o fluxo Steam no host da API: o backend devolve uma URL com nonce;
 * o browser abre essa URL e recebe o sessionid do Django antes do callback OpenID.
 */
export async function POST(request: Request) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.baseUrl;
  if (!baseUrl) {
    return NextResponse.json({ detail: "Missing baseUrl" }, { status: 500 });
  }

  let nextPath = "/profile";
  try {
    const body = (await request.json()) as { next?: string };
    if (typeof body?.next === "string" && body.next.startsWith("/")) {
      nextPath = body.next;
    }
  } catch {
    /* body opcional */
  }

  const axiosResp = await api.post(
    "/api/auth/steam/prepare/",
    { next: nextPath },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      validateStatus: () => true,
    }
  );

  if (axiosResp.status !== 200) {
    const data =
      typeof axiosResp.data === "object" && axiosResp.data !== null
        ? axiosResp.data
        : { detail: String(axiosResp.data ?? "prepare failed") };
    return NextResponse.json(data, { status: axiosResp.status });
  }

  return NextResponse.json(axiosResp.data);
}
