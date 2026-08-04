export type GlobalMessageLevel = "low" | "medium" | "high";
export type GlobalMessageStatus = "pending" | "active" | "completed" | "cancelled";

export interface GlobalMessageAuthor {
  id: string;
  username: string;
  name: string;
  profile_photo: string | null;
}

export interface GlobalMessageDto {
  id: string;
  body: string;
  level: GlobalMessageLevel;
  status: GlobalMessageStatus;
  display_seconds: number;
  remaining_seconds: number;
  queued_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  expires_at: string | null;
  slot_index: number | null;
  queue_position?: number;
  author: GlobalMessageAuthor;
}

export interface GlobalMessagesSnapshot {
  type?: string;
  messages: GlobalMessageDto[];
  server_time: string;
}

export interface GlobalMessagesQuota {
  week_key: string;
  total_used: number;
  total_limit: number;
  total_remaining: number;
  low_used: number;
  low_limit: number;
  low_remaining: number;
  medium_used: number;
  medium_limit: number;
  medium_remaining: number;
  high_used: number;
  high_limit: number;
  high_remaining: number;
}

export interface GlobalMessagesHistoryPage {
  results: GlobalMessageDto[];
  next: string | null;
  previous: string | null;
}

async function apiFetch(path: string, init?: RequestInit) {
  return fetch(path, { credentials: "include", ...init });
}

export async function getActiveGlobalMessages(): Promise<GlobalMessagesSnapshot> {
  try {
    const res = await apiFetch("/api/global-messages/active");
    if (!res.ok) return { messages: [], server_time: new Date().toISOString() };
    return res.json();
  } catch {
    return { messages: [], server_time: new Date().toISOString() };
  }
}

export async function tickGlobalMessages(): Promise<GlobalMessagesSnapshot | null> {
  try {
    const res = await apiFetch("/api/global-messages/tick", { method: "POST" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getGlobalMessagesQuota(): Promise<GlobalMessagesQuota | null> {
  try {
    const res = await apiFetch("/api/global-messages/quota");
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function createGlobalMessage(payload: {
  body: string;
  level: GlobalMessageLevel;
}): Promise<{
  ok: boolean;
  status: number;
  data?: {
    message: GlobalMessageDto;
    quota: GlobalMessagesQuota;
    active: GlobalMessagesSnapshot;
  };
  error?: string;
  quota?: GlobalMessagesQuota;
}> {
  try {
    const res = await apiFetch("/api/global-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detailRaw = data?.detail;
      let detail = "Não foi possível enviar.";
      let quota = data?.quota as GlobalMessagesQuota | undefined;
      if (typeof detailRaw === "string") {
        detail = detailRaw;
      } else if (Array.isArray(detailRaw)) {
        detail = String(detailRaw[0]);
      } else if (data?.body?.[0]) {
        detail = String(data.body[0]);
      } else if (data?.level?.[0]) {
        detail = String(data.level[0]);
      }
      if (!quota && data?.quota) quota = data.quota;
      return {
        ok: false,
        status: res.status,
        error: detail,
        quota,
      };
    }
    return { ok: true, status: res.status, data };
  } catch {
    return { ok: false, status: 500, error: "Erro de rede ao enviar mensagem." };
  }
}

export async function getGlobalMessagesHistory(
  cursor?: string
): Promise<GlobalMessagesHistoryPage> {
  try {
    const url = cursor
      ? `/api/global-messages/history?cursor=${encodeURIComponent(cursor)}`
      : "/api/global-messages/history";
    const res = await apiFetch(url);
    if (!res.ok) return { results: [], next: null, previous: null };
    return res.json();
  } catch {
    return { results: [], next: null, previous: null };
  }
}
