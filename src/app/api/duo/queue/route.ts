import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

async function getToken() {
  return (await cookies()).get("accessToken")?.value;
}

export async function GET() {
  const accessToken = await getToken();
  if (!accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.baseUrl) {
    return NextResponse.json({ detail: "Missing baseUrl" }, { status: 500 });
  }

  const axiosResp = await api.get("/api/v1/duo/queue/", {
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

  return NextResponse.json(json, { status: axiosResp.status });
}

export async function POST(request: NextRequest) {
  const accessToken = await getToken();
  if (!accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.baseUrl) {
    return NextResponse.json({ detail: "Missing baseUrl" }, { status: 500 });
  }

  const body = await request.text();

  const axiosResp = await api.post("/api/v1/duo/queue/", body, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
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

  return NextResponse.json(json, { status: axiosResp.status });
}
