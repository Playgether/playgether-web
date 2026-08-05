"use server";

import { cookies } from "next/headers";
import { Cut } from "@/types/Cut";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function getCuts(cursor?: string, username?: string): Promise<{
  data: Cut[];
  next: string | null;
}> {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (username) params.set("username", username);
  const query = params.toString() ? `?${params}` : "";

  try {
    const res = await fetch(`${API_URL}/api/v1/cuts/${query}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return { data: [], next: null };
    const json = await res.json();
    return {
      data: Array.isArray(json) ? json : (json.results ?? []),
      next: json.next ?? null,
    };
  } catch {
    return { data: [], next: null };
  }
}

export async function getCutById(id: number | string): Promise<Cut | null> {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  try {
    const res = await fetch(`${API_URL}/api/v1/cuts/${id}/`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as Cut;
  } catch {
    return null;
  }
}

export async function createCut(payload: {
  caption: string;
  video_file: string;
  thumbnail?: string;
  duration?: number;
  width?: number;
  height?: number;
  file_format?: string;
  bytes_file?: number;
}): Promise<Cut | null> {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return null;

  try {
    const res = await fetch(`${API_URL}/api/v1/cuts/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as Cut;
  } catch {
    return null;
  }
}
