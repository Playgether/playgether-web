import { api } from "./api";

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

export async function getConversations(): Promise<DMConversation[]> {
  try {
    const res = await api.get("/api/v1/dm/conversations/", { withCredentials: true });
    return res.data;
  } catch {
    return [];
  }
}

export async function startConversation(userId: string): Promise<DMConversation | null> {
  try {
    const res = await api.post(
      "/api/v1/dm/conversations/start/",
      { user_id: userId },
      { withCredentials: true }
    );
    return res.data;
  } catch {
    return null;
  }
}

export interface PaginatedMessages {
  results: DMMessage[];
  next: string | null;
  previous: string | null;
}

export async function getMessages(
  conversationId: string,
  cursor?: string
): Promise<PaginatedMessages> {
  try {
    const params = cursor ? { cursor } : {};
    const res = await api.get(`/api/v1/dm/conversations/${conversationId}/messages/`, {
      withCredentials: true,
      params,
    });
    return res.data;
  } catch {
    return { results: [], next: null, previous: null };
  }
}

export async function markConversationRead(conversationId: string): Promise<void> {
  try {
    await api.post(`/api/v1/dm/conversations/${conversationId}/read/`, {}, { withCredentials: true });
  } catch {
    // ignore
  }
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    await api.delete(`/api/v1/dm/conversations/${conversationId}/delete/`);
    return true;
  } catch {
    return false;
  }
}

export async function getUserPublicKey(userId: string): Promise<string | null> {
  try {
    const res = await api.get(`/api/v1/users/${userId}/public-key/`, { withCredentials: true });
    return res.data.public_key ?? null;
  } catch {
    return null;
  }
}
