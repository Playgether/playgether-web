export type WebSocketTicketResponse = {
  ticket: string;
  expiresIn: number;
};

export function getWebSocketBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.hostname}:8000`;
  }

  return "ws://localhost:8000";
}

export async function requestWebSocketTicket(
  path: string,
): Promise<WebSocketTicketResponse> {
  const response = await fetch(
    `/api/ws/authorize?path=${encodeURIComponent(path)}`,
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("WebSocket authorization failed.");
  }

  const data = (await response.json()) as {
    ticket?: string;
    expires_in?: number;
  };
  if (!data.ticket) {
    throw new Error("WebSocket ticket was not returned.");
  }

  return {
    ticket: data.ticket,
    expiresIn: data.expires_in ?? 30,
  };
}

export function buildAuthenticatedWebSocketUrl(
  path: string,
  ticket: string,
): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${getWebSocketBaseUrl()}${path}${separator}ticket=${encodeURIComponent(ticket)}`;
}
