/** Cross-tree events for duo invite toasts ↔ chat widget / MatchResults. */

export const DUO_INVITE_CHANGED_EVENT = "playgether:duo-invite-changed";
export const DUO_OPEN_CHAT_EVENT = "playgether:duo-open-chat";

export type DuoOpenChatDetail = {
  partnerUserId: number | string;
  conversationId?: string | null;
  partnerUsername?: string;
  partnerName?: string;
  partnerAvatar?: string | null;
};

export function emitDuoInviteChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DUO_INVITE_CHANGED_EVENT));
}

export function emitDuoOpenChat(detail: DuoOpenChatDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DUO_OPEN_CHAT_EVENT, { detail }));
}
