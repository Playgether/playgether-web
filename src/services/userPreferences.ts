import { apiFetch } from "@/services/apiFetch";

export interface UserPreferences {
  id: number;
  // Appearance
  theme: "light" | "dark";
  reduce_animations: boolean;
  ui_density: "normal" | "compact";
  font_size: "small" | "medium" | "large";
  // Notifications
  notif_likes: boolean;
  notif_comments: boolean;
  notif_new_followers: boolean;
  notif_messages: boolean;
  notif_mentions: boolean;
  notif_clan_invites: boolean;
  notif_friend_requests: boolean;
  notif_platform_updates: boolean;
  // Privacy
  private_account: boolean;
  show_followers: boolean;
  show_following: boolean;
  show_online_status: boolean;
  show_read_receipts: boolean;
  who_can_see_posts: "everyone" | "followers" | "nobody";
  who_can_message: "everyone" | "friends" | "nobody";
  who_can_comment: "everyone" | "friends" | "nobody";
  who_can_tag: "everyone" | "friends" | "nobody";
  updated_at: string;
}

export type PreferencesPatch = Partial<Omit<UserPreferences, "id" | "updated_at">>;

export async function getPreferences(): Promise<UserPreferences> {
  const resp = await apiFetch("/api/preferences/", { method: "GET" });
  if (!resp.ok) throw new Error("Failed to load preferences");
  return resp.json();
}

export async function patchPreferences(data: PreferencesPatch, totpCode?: string): Promise<UserPreferences> {
  const body: Record<string, unknown> = { ...data };
  if (totpCode) body.totp_code = totpCode;

  const resp = await apiFetch("/api/preferences/", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({})) as { detail?: string; requires_2fa?: boolean };
    const error = new Error(err.detail ?? "Failed to update preferences") as Error & { requires_2fa?: boolean };
    if (err.requires_2fa) error.requires_2fa = true;
    throw error;
  }
  return resp.json();
}
