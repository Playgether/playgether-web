import "server-only";

import { headers } from "next/headers";

/**
 * Headers para repassar o IP/User-Agent reais do navegador ao Django quando a
 * chamada parte de uma Server Action/Route Handler (o axios do Next não carrega
 * esses dados do cliente original, então sem isso o backend registra o IP/UA do
 * próprio servidor Next em vez do dispositivo do usuário).
 */
export async function getClientRequestHeaders(): Promise<Record<string, string>> {
  const hdrs = await headers();
  const userAgent = hdrs.get("user-agent") ?? undefined;
  const forwardedFor = hdrs.get("x-forwarded-for");
  const realIp = hdrs.get("x-real-ip");
  const rawIp = forwardedFor?.split(",")[0]?.trim() ?? realIp ?? undefined;
  const isLocalhost = rawIp === "::1" || rawIp === "127.0.0.1";
  const clientIp = rawIp && !isLocalhost ? rawIp : undefined;

  const result: Record<string, string> = {};
  if (userAgent) result["X-Client-User-Agent"] = userAgent;
  if (clientIp) result["X-Forwarded-For"] = clientIp;
  return result;
}
