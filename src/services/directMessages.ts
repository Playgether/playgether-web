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
  encrypted_body: string;
  encrypted_key_recipient: string;
  encrypted_key_sender: string;
  iv: string;
  timestamp: string;
  is_read: boolean;
}

export interface DMConversation {
  id: string;
  other_participant: DMParticipant | null;
  last_message: DMMessage | null;
  unread_count: number;
  updated_at: string;
}

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

export async function startConversation(userId: string): Promise<DMConversation | null> {
  try {
    const res = await apiFetch("/api/dm/conversations/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
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
