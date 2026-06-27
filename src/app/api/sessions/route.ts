import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";

export interface SessionEntry {
  session_id: string;
  ip_address: string | null;
  user_agent: string;
  created_at: string;
  last_seen_at: string;
  is_current: boolean;
  location?: { city: string; country: string; flag: string } | null;
  device?: { browser: string; os: string; type: "desktop" | "mobile" | "tablet" };
}

function parseUserAgent(ua: string): SessionEntry["device"] {
  const s = ua.toLowerCase();

  let type: "desktop" | "mobile" | "tablet" = "desktop";
  if (/tablet|ipad|playbook|silk/i.test(ua)) type = "tablet";
  else if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) type = "mobile";

  let browser = "Navegador desconhecido";
  if (s.includes("edg/") || s.includes("edge/")) browser = "Edge";
  else if (s.includes("chrome") && !s.includes("chromium")) browser = "Chrome";
  else if (s.includes("firefox")) browser = "Firefox";
  else if (s.includes("safari") && !s.includes("chrome")) browser = "Safari";
  else if (s.includes("opera") || s.includes("opr/")) browser = "Opera";

  let os = "SO desconhecido";
  if (s.includes("windows")) os = "Windows";
  else if (s.includes("mac os") || s.includes("macos")) os = "macOS";
  else if (s.includes("android")) os = "Android";
  else if (s.includes("iphone") || s.includes("ipad")) os = "iOS";
  else if (s.includes("linux")) os = "Linux";

  return { browser, os, type };
}

async function geolocateIp(
  ip: string | null,
): Promise<{ city: string; country: string; flag: string } | null> {
  if (!ip || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { city: "Local", country: "Desenvolvimento", flag: "🏠" };
  }
  try {
    const resp = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country,countryCode`, {
      next: { revalidate: 3600 },
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as {
      status: string;
      city?: string;
      country?: string;
      countryCode?: string;
    };
    if (data.status !== "success") return null;
    const flag = (data.countryCode ?? "")
      .toUpperCase()
      .split("")
      .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
      .join("");
    return { city: data.city ?? "", country: data.country ?? "", flag };
  } catch {
    return null;
  }
}

export async function GET() {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  const axiosResp = await api.get("api/v1/sessions/", {
    headers: { Authorization: `Bearer ${accessToken}` },
    validateStatus: () => true,
    responseType: "text",
  });

  const text = axiosResp.data ?? "";
  const raw: SessionEntry[] | { detail: string } = (() => {
    try { return JSON.parse(text); }
    catch { return { detail: text }; }
  })();

  if (!Array.isArray(raw)) {
    return NextResponse.json(raw, { status: axiosResp.status });
  }

  // Enrich with geolocation + device parsing in parallel
  const enriched = await Promise.all(
    raw.map(async (s) => ({
      ...s,
      device: parseUserAgent(s.user_agent ?? ""),
      location: await geolocateIp(s.ip_address),
    })),
  );

  return NextResponse.json(enriched, { status: 200 });
}
