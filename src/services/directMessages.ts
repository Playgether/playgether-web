export interface DMParticipant {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  public_key: string | null;
  profile_photo: string | null;
}

export interface DMMessage {
  id: string;
  conversation_id?: string;
  sender_id: string;
  sender_username: string;
  // Plaintext body — group messages only
  body?: string;
  // E2E encrypted fields — private DMs only
  encrypted_body?: string;
  encrypted_key_recipient?: string;
  encrypted_key_sender?: string;
  iv?: string;
  timestamp: string;
  is_read: boolean;
}

export interface DMConversation {
  id: string;
  type: "private" | "group";
  status?: "active" | "pending";
  name: string;
  other_participant: DMParticipant | null;
  participants: DMParticipant[] | null;
  last_message: DMMessage | null;
  unread_count: number;
  is_muted?: boolean;
  has_left?: boolean;
  /** False when messaging is restricted (e.g. privacy / block). */
  can_message?: boolean;
  can_message_reason?: string | null;
  is_incoming_request?: boolean;
  updated_at: string;
}

export type StartConversationResult =
  | { ok: true; conversation: DMConversation }
  | { ok: false; error: string };

export interface PaginatedMessages {
  results: DMMessage[];
  next: string | null;
  previous: string | null;
}

async function apiFetch(path: string, init?: RequestInit) {
  return fetch(path, { credentials: "include", ...init });
}

export async function getConversations(): Promise<DMConversation[]> {
  try {
    const res = await apiFetch("/api/dm/conversations");
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export type StartConversationOptions = {
  source?: "duo" | "megaphone";
  /** Accepted duo invite id — unlocks ACTIVE chat regardless of privacy prefs. */
  duoInviteId?: string | number;
  globalMessageId?: string;
};

export async function startConversation(
  userId: string,
  options?: StartConversationOptions,
): Promise<StartConversationResult> {
  try {
    const body: Record<string, string> = { user_id: userId };
    if (options?.source === "duo") {
      body.source = "duo";
    }
    if (options?.source === "megaphone") {
      body.source = "megaphone";
    }
    if (options?.duoInviteId != null) {
      body.duo_invite_id = String(options.duoInviteId);
    }
    if (options?.globalMessageId) {
      body.global_message_id = options.globalMessageId;
    }
    const res = await apiFetch("/api/dm/conversations/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const detail = typeof data?.detail === "string" ? data.detail : "Não foi possível iniciar a conversa.";
      return { ok: false, error: detail };
    }
    const conversation = (await res.json()) as DMConversation;
    return { ok: true, conversation };
  } catch {
    return { ok: false, error: "Não foi possível iniciar a conversa." };
  }
}

export async function acceptMessageRequest(conversationId: string): Promise<DMConversation | null> {
  try {
    const res = await apiFetch(`/api/dm/conversations/${conversationId}/accept`, {
      method: "POST",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function createGroup(name: string, memberIds: string[]): Promise<DMConversation | null> {
  try {
    const res = await apiFetch("/api/dm/conversations/create_group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, member_ids: memberIds }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getMessages(
  conversationId: string,
  cursor?: string
): Promise<PaginatedMessages> {
  try {
    const url = cursor
      ? `/api/dm/conversations/${conversationId}/messages?cursor=${encodeURIComponent(cursor)}`
      : `/api/dm/conversations/${conversationId}/messages`;
    const res = await apiFetch(url);
    if (!res.ok) return { results: [], next: null, previous: null };
    return res.json();
  } catch {
    return { results: [], next: null, previous: null };
  }
}

export async function markConversationRead(conversationId: string): Promise<void> {
  try {
    await apiFetch(`/api/dm/conversations/${conversationId}/read`, { method: "POST" });
  } catch {
    // ignore
  }
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/dm/conversations/${conversationId}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function leaveGroup(conversationId: string): Promise<DMConversation | null> {
  try {
    const res = await apiFetch(`/api/dm/conversations/${conversationId}/leave`, { method: "POST" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function muteConversation(conversationId: string, muted: boolean): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/dm/conversations/${conversationId}/mute`, {
      method: muted ? "POST" : "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getUserPublicKey(userId: string): Promise<string | null> {
  try {
    const res = await apiFetch(`/api/users/${userId}/public-key`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.public_key ?? null;
  } catch {
    return null;
  }
}
