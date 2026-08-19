import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UAParser } from "ua-parser-js";
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
  if (!ua) return { browser: "Navegador desconhecido", os: "SO desconhecido", type: "desktop" };

  const result = UAParser(ua);

  const browser = [result.browser.name, result.browser.version?.split(".")[0]]
    .filter(Boolean)
    .join(" ") || "Navegador desconhecido";

  // iOS/iPadOS não expõem o modelo exato (ex.: "iPhone 13") nem no UA nem via
  // client hints — a Apple simplesmente não repassa esse dado. "iPhone"/"iPad"
  // genérico é o máximo detectável nesses casos.
  const deviceLabel = [result.device.vendor, result.device.model]
    .filter(Boolean)
    .join(" ");
  const os = deviceLabel || [result.os.name, result.os.version].filter(Boolean).join(" ") || "SO desconhecido";

  const rawType = result.device.type;
  const type: "desktop" | "mobile" | "tablet" =
    rawType === "tablet" ? "tablet" : rawType === "mobile" ? "mobile" : "desktop";

  return { browser, os, type };
}

async function geolocateIp(
  ip: string | null,
): Promise<{ city: string; country: string; flag: string } | null> {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { city: "Local", country: "Desenvolvimento", flag: "🏠" };
  }
  try {
    const resp = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,city,region,country,countryCode`,
      { next: { revalidate: 3600 } },
    );
    if (!resp.ok) return null;
    const data = (await resp.json()) as {
      status: string;
      city?: string;
      region?: string;
      country?: string;
      countryCode?: string;
    };
    if (data.status !== "success") return null;
    const flag = (data.countryCode ?? "")
      .toUpperCase()
      .split("")
      .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
      .join("");
    // Dentro do Brasil, "Cidade, UF" é mais útil que "Cidade, Brasil".
    const region =
      data.countryCode === "BR" && data.region ? data.region : data.country ?? "";
    return { city: data.city ?? "", country: region, flag };
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
