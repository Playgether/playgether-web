"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, X as XIcon, Users, LogOut, VolumeX } from "lucide-react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import InputMessage from "./InputMessage";
import ChatTabs from "./ChatTabs";
import NoConversationSelected from "./NoConversationSelected";
import { useE2ECrypto } from "@/context/E2ECryptoContext";
import { useAuthContext } from "@/context/AuthContext";
import { useDMWebSocket } from "@/hooks/useDMWebSocket";
import { useDMNotifications } from "@/hooks/useDMNotifications";
import { useDMUnread } from "@/context/DMUnreadContext";
import {
  createGroup,
  deleteConversation,
  getConversations,
  getMessages,
  leaveGroup,
  markConversationRead,
  muteConversation,
  startConversation,
  type DMConversation,
  type DMMessage,
} from "@/services/directMessages";
import type { ConversationInterface } from "../../types/chat/ConversationInterface";
import type { MessageInterface } from "../../types/chat/MessageInterface";
import { resolvePlaygetherMediaUrl } from "@/lib/resolvePlaygetherMediaUrl";
import { decodeSharedContent, sharedContentPreviewText } from "@/lib/sharedContent";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import type { MegaphoneReplyDraft } from "@/context/ConversationsWidgetContext";


interface ConversationsContentProps {
  listHeight?: string;
  chatHeight?: string;
  autoOpenId?: string;
  forceSelectId?: string;
  forceDraft?: string;
  forceMegaphoneReply?: MegaphoneReplyDraft;
}

function toConversationInterface(
  dm: DMConversation,
  decryptedPreview: string | null
): ConversationInterface {
  if (dm.type === "group") {
    return {
      id: dm.id,
      name: dm.name || "Grupo",
      avatar: "",
      lastMessage: dm.last_message?.body ?? "",
      timestamp: dm.last_message
        ? new Date(dm.last_message.timestamp).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      unread: (dm.unread_count ?? 0) > 0 ? dm.unread_count : undefined,
      type: "group" as const,
      isMuted: Boolean(dm.is_muted),
      hasLeft: Boolean(dm.has_left),
      canMessage: dm.can_message !== false && !dm.has_left,
    };
  }

  const other = dm.other_participant;
  return {
    id: dm.id,
    name: other ? `${other.first_name} ${other.last_name}`.trim() || other.username : "?",
    avatar: resolvePlaygetherMediaUrl(other?.profile_photo) || "",
    lastMessage: dm.last_message ? (decryptedPreview ?? "🔒") : "",
    timestamp: dm.last_message
      ? new Date(dm.last_message.timestamp).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    unread: (dm.unread_count ?? 0) > 0 ? dm.unread_count : undefined,
    type: "private" as const,
    username: other?.username,
    isMuted: Boolean(dm.is_muted),
    hasLeft: Boolean(dm.has_left),
    canMessage: dm.can_message !== false,
  };
}

function getDecryptedPreview(
  conv: DMConversation,
  previews: Record<string, { messageId: string; text: string }>
): string | null {
  const cached = previews[conv.id];
  if (!cached) return null;
  // Se last_message mudou e ainda não decriptamos a nova, ainda mostramos o
  // texto anterior até o effect atualizar (melhor que ficar em 🔒).
  return cached.text;
}

function sortConversations(convs: DMConversation[]): DMConversation[] {
  return [...convs].sort((a, b) => {
    const muteDiff = Number(Boolean(a.is_muted)) - Number(Boolean(b.is_muted));
    if (muteDiff !== 0) return muteDiff;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

function UnreadBadge({ count, muted }: { count: number; muted?: boolean }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "absolute -right-0.5 -top-0.5 z-10 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-background px-1 text-[9px] font-bold leading-none tabular-nums",
        muted
          ? "bg-zinc-600 text-zinc-200"
          : "bg-gradient-secondary text-white"
      )}
      title={muted ? "Conversa silenciada" : undefined}
      aria-label={
        muted
          ? `${count} mensagem${count === 1 ? "" : "ns"} não lida${count === 1 ? "" : "s"} (silenciada)`
          : `${count} mensagem${count === 1 ? "" : "ns"} não lida${count === 1 ? "" : "s"}`
      }
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function ConversationAvatar({
  name,
  avatar,
  unread,
  isMuted,
  isGroup,
}: {
  name: string;
  avatar?: string;
  unread?: number;
  isMuted?: boolean;
  isGroup?: boolean;
}) {
  return (
    <div className="relative shrink-0">
      {isGroup ? (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
          <Users className="h-4 w-4 text-primary" />
        </div>
      ) : (
        <ProfileAvatar
          displayName={name}
          profilePhoto={avatar || null}
          sizeClass="h-9 w-9"
          fallbackTextClassName="text-xs"
        />
      )}
      <UnreadBadge count={unread ?? 0} muted={isMuted} />
    </div>
  );
}

function ConversationRowMeta({
  name,
  lastMessage,
  timestamp,
  isMuted,
  hasLeft,
  trailing,
}: {
  name: string;
  lastMessage: string;
  timestamp: string;
  isMuted?: boolean;
  hasLeft?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-sm font-medium">{name}</p>
          {isMuted ? (
            <VolumeX
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
              aria-label="Conversa silenciada"
            />
          ) : null}
          {hasLeft ? (
            <span className="shrink-0 text-[10px] text-muted-foreground">Saiu</span>
          ) : null}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {lastMessage || "Sem mensagens"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {trailing}
        <span className="text-xs text-muted-foreground">{timestamp}</span>
      </div>
    </>
  );
}

export function ConversationsContent({
  listHeight = "calc(100% - 120px)",
  chatHeight = "flex-1",
  autoOpenId,
  forceSelectId,
  forceDraft,
  forceMegaphoneReply,
}: ConversationsContentProps) {
  const { user } = useAuthContext();
  const { isReady, encryptForUser, decrypt } = useE2ECrypto();
  const { markRead, refresh: refreshUnread } = useDMUnread();

  const [conversations, setConversations] = useState<DMConversation[]>([]);
  /** Preview decriptado por conversa, amarrado ao id da last_message. */
  const [decryptedPreviews, setDecryptedPreviews] = useState<
    Record<string, { messageId: string; text: string }>
  >({});
  const [selectedConversation, setSelectedConversation] = useState<DMConversation | null>(null);
  const autoOpenedRef = useRef(false);

  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [rawMessages, setRawMessages] = useState<DMMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [megaphoneReply, setMegaphoneReply] = useState<MegaphoneReplyDraft | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // New private conversation search
  const [showNewConv, setShowNewConv] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; username: string; first_name: string; last_name: string }[]>([]);
  const [searching, setSearching] = useState(false);

  // Group creation
  type GroupUser = { id: string; username: string; first_name: string; last_name: string };
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [groupSearchResults, setGroupSearchResults] = useState<GroupUser[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupUser[]>([]);
  const [groupSearching, setGroupSearching] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const seenIdsRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevForceSelectRef = useRef<string | undefined>(undefined);
  const selectedIdRef = useRef<string | null>(null);

  // ── Load conversations ────────────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    const data = await getConversations();
    const selectedId = selectedIdRef.current;
    const sorted = sortConversations(
      data.map((c) =>
        c.id === selectedId ? { ...c, unread_count: 0 } : c
      )
    );
    setConversations(sorted);
    setSelectedConversation((prev) => {
      if (!prev) return prev;
      const updated = sorted.find((c) => c.id === prev.id);
      return updated ?? prev;
    });
    return sorted;
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Decrypt last-message previews (private DMs only) ─────────────────────

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;

    conversations.forEach(async (conv) => {
      if (conv.type === "group") return;
      const msg = conv.last_message;
      if (!msg) return;
      if (!msg.encrypted_body || !msg.encrypted_key_recipient || !msg.iv) return;

      // Já temos o plaintext desta last_message — não reprocessa
      const cached = decryptedPreviews[conv.id];
      if (cached?.messageId === msg.id) return;

      const isSender = msg.sender_id === user?.user_id;
      const plain = await decrypt(
        msg.encrypted_body,
        msg.encrypted_key_recipient,
        msg.iv,
        isSender,
        msg.encrypted_key_sender ?? ""
      );
      if (cancelled || !plain) return;
      const shared = decodeSharedContent(plain);
      const text = shared ? sharedContentPreviewText(shared) : plain;
      setDecryptedPreviews((prev) => {
        // Evita sobrescrever se outra mensagem mais nova já chegou
        if (prev[conv.id]?.messageId === msg.id) return prev;
        return { ...prev, [conv.id]: { messageId: msg.id, text } };
      });
    });

    return () => {
      cancelled = true;
    };
    // decryptedPreviews propositalmente fora das deps — usamos o valor atual só como cache
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, isReady, decrypt, user]);

  // ── Select conversation → load history ───────────────────────────────────

  const selectConversation = useCallback(
    async (conv: DMConversation) => {
      selectedIdRef.current = conv.id;
      setSelectedConversation(conv);
      setMessages([]);
      setRawMessages([]);
      setMegaphoneReply(null);
      seenIdsRef.current.clear();

      setLoadingMessages(true);
      const { results } = await getMessages(conv.id);
      const sorted = [...results].reverse();
      setRawMessages(sorted);

      const decrypted: MessageInterface[] = [];
      for (const msg of sorted) {
        if (seenIdsRef.current.has(msg.id)) continue;
        seenIdsRef.current.add(msg.id);
        const isSender = msg.sender_id === user?.user_id;

        let content: string;
        if (msg.body) {
          content = msg.body;
        } else {
          const plain = await decrypt(
            msg.encrypted_body!,
            msg.encrypted_key_recipient!,
            msg.iv!,
            isSender,
            msg.encrypted_key_sender ?? ""
          );
          content = plain ?? "🔒 Não foi possível decifrar";
        }

        const shared = decodeSharedContent(content);
        decrypted.push({
          id: msg.id,
          sender: msg.sender_username,
          content: shared ? sharedContentPreviewText(shared) : content,
          sharedContent: shared ?? undefined,
          timestamp: new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isOwn: isSender,
        });
      }
      setMessages(decrypted);
      setLoadingMessages(false);
      const unreadBefore = conv.unread_count ?? 0;
      markConversationRead(conv.id);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c))
      );
      if (unreadBefore > 0) markRead(unreadBefore);
      else void refreshUnread();
    },
    [decrypt, user, markRead, refreshUnread]
  );

  // Auto-open a specific conversation when navigated from a profile
  useEffect(() => {
    if (!autoOpenId || autoOpenedRef.current || conversations.length === 0) return;
    const target = conversations.find((c) => c.id === autoOpenId);
    if (target) {
      autoOpenedRef.current = true;
      selectConversation(target);
    }
  }, [autoOpenId, conversations, selectConversation]);

  // Force-select a conversation (e.g. "Mensagem" button on profile)
  useEffect(() => {
    if (!forceSelectId || forceSelectId === prevForceSelectRef.current) return;
    prevForceSelectRef.current = forceSelectId;
    void loadConversations().then(async (convs) => {
      const target = convs.find((c) => c.id === forceSelectId);
      if (!target) return;
      await selectConversation(target);
      if (forceMegaphoneReply) {
        setMegaphoneReply(forceMegaphoneReply);
        setMessageInput("");
      } else if (forceDraft) {
        setMessageInput(forceDraft);
      }
      setTimeout(() => inputRef.current?.focus(), 150);
    });
  }, [forceSelectId, forceDraft, forceMegaphoneReply, loadConversations, selectConversation]);

  // ── WebSocket: receive new messages ──────────────────────────────────────

  const handleNewMessage = useCallback(
    async (msg: DMMessage) => {
      if (seenIdsRef.current.has(msg.id)) return;
      seenIdsRef.current.add(msg.id);

      const isSender = msg.sender_id === user?.user_id;

      let content: string;
      if (msg.body) {
        content = msg.body;
      } else {
        const plain = await decrypt(
          msg.encrypted_body!,
          msg.encrypted_key_recipient!,
          msg.iv!,
          isSender,
          msg.encrypted_key_sender ?? ""
        );
        content = plain ?? "🔒 Não foi possível decifrar";
      }

      const shared = decodeSharedContent(content);
      const displayText = shared ? sharedContentPreviewText(shared) : content;
      const ui: MessageInterface = {
        id: msg.id,
        sender: msg.sender_username,
        content: displayText,
        sharedContent: shared ?? undefined,
        timestamp: new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: isSender,
      };

      setMessages((prev) => [...prev, ui]);

      setConversations((prev) =>
        sortConversations(
          prev.map((c) =>
            c.id === msg.conversation_id
              ? {
                  ...c,
                  last_message: msg,
                  updated_at: msg.timestamp,
                  // Está com a conversa aberta → não acumula unread
                  unread_count: isSender ? c.unread_count : 0,
                }
              : c
          )
        )
      );
      if (msg.conversation_id && content) {
        setDecryptedPreviews((prev) => ({
          ...prev,
          [msg.conversation_id!]: { messageId: msg.id, text: displayText },
        }));
      }
      // Marca como lida no servidor enquanto a conversa está aberta
      if (!isSender && msg.conversation_id) {
        void markConversationRead(msg.conversation_id);
      }
    },
    [decrypt, user]
  );

  const { sendEncryptedMessage, sendGroupMessage } = useDMWebSocket({
    conversationId: selectedConversation?.id ?? null,
    onNewMessage: handleNewMessage,
  });

  useDMNotifications({
    onNotification: useCallback(
      (convId: string) => {
        // Conversa aberta: marca como lida e não mostra badge
        if (convId === selectedConversation?.id) {
          void markConversationRead(convId);
          return;
        }

        // Atualiza o numerozinho na lista imediatamente
        setConversations((prev) => {
          if (!prev.some((c) => c.id === convId)) return prev;
          return sortConversations(
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    unread_count: (c.unread_count ?? 0) + 1,
                    updated_at: new Date().toISOString(),
                  }
                : c
            )
          );
        });

        // Sincroniza preview / conversas novas sem apagar unread otimista
        void getConversations().then((data) => {
          const selectedId = selectedIdRef.current;
          setConversations((prev) => {
            const byId = new Map(prev.map((c) => [c.id, c]));
            const merged = data.map((c) => {
              const local = byId.get(c.id);
              const serverUnread = c.unread_count ?? 0;
              const localUnread = local?.unread_count ?? 0;
              // Mantém o maior contador: evita race em que o GET chega
              // antes do is_read=False estar visível no banco.
              const unread_count =
                c.id === selectedId
                  ? 0
                  : Math.max(serverUnread, localUnread);
              return { ...c, unread_count };
            });
            return sortConversations(merged);
          });
        });
      },
      [selectedConversation?.id]
    ),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const typed = messageInput.trim();
    if (!typed || !selectedConversation || sending) return;
    if (selectedConversation.can_message === false || selectedConversation.has_left) return;

    const text = megaphoneReply
      ? `Respondendo ao alto-falante de @${megaphoneReply.authorUsername}:\n“${megaphoneReply.quote}”\n\n${typed}`
      : typed;

    if (selectedConversation.type === "group") {
      setSending(true);
      try {
        sendGroupMessage(text);
        setMessageInput("");
        setMegaphoneReply(null);
      } finally {
        setSending(false);
      }
      return;
    }

    if (!isReady) return;
    const recipientKey = selectedConversation.other_participant?.public_key;
    if (!recipientKey) return;

    setSending(true);
    try {
      const encrypted = await encryptForUser(text, recipientKey);
      if (!encrypted) return;
      sendEncryptedMessage({
        encrypted_body: encrypted.encryptedBody,
        encrypted_key_recipient: encrypted.encryptedKeyRecipient,
        encrypted_key_sender: encrypted.encryptedKeySender,
        iv: encrypted.iv,
      });
      setMessageInput("");
      setMegaphoneReply(null);
    } finally {
      setSending(false);
    }
  }, [
    messageInput,
    megaphoneReply,
    selectedConversation,
    isReady,
    sending,
    encryptForUser,
    sendEncryptedMessage,
    sendGroupMessage,
  ]);

  // ── Private conversation search ───────────────────────────────────────────

  const handleSearchUsers = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?search=${encodeURIComponent(q)}`, { credentials: "include" });
      const json = await res.json();
      const data = Array.isArray(json) ? json : (json?.results ?? []);
      setSearchResults(data.slice(0, 8));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleStartConversation = useCallback(async (userId: string) => {
    const conv = await startConversation(userId);
    if (!conv) return;
    setShowNewConv(false);
    setSearchQuery("");
    setSearchResults([]);
    await loadConversations();
    selectConversation(conv);
  }, [loadConversations, selectConversation]);

  const clearSelectedConversation = useCallback(() => {
    selectedIdRef.current = null;
    setSelectedConversation(null);
  }, []);

  const handleDeleteConversation = useCallback(async (convId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const ok = await deleteConversation(convId);
    if (!ok) return;
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (selectedConversation?.id === convId) clearSelectedConversation();
  }, [selectedConversation, clearSelectedConversation]);

  const handleBlockUser = useCallback(async () => {
    const username = selectedConversation?.other_participant?.username;
    const convId = selectedConversation?.id;
    if (!username || !convId) return;
    const res = await fetch(`/api/profiles/${username}/block`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("block failed");
    await deleteConversation(convId);
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    clearSelectedConversation();
  }, [selectedConversation, clearSelectedConversation]);

  // ── Group creation ────────────────────────────────────────────────────────

  const handleGroupSearchUsers = useCallback(async (q: string) => {
    setGroupSearchQuery(q);
    if (!q.trim()) { setGroupSearchResults([]); return; }
    setGroupSearching(true);
    try {
      const res = await fetch(`/api/users/search?search=${encodeURIComponent(q)}`, { credentials: "include" });
      const json = await res.json();
      const data: GroupUser[] = Array.isArray(json) ? json : (json?.results ?? []);
      setGroupSearchResults(data.slice(0, 8).filter((u) => !groupMembers.some((m) => m.id === u.id)));
    } catch {
      setGroupSearchResults([]);
    } finally {
      setGroupSearching(false);
    }
  }, [groupMembers]);

  const handleAddGroupMember = useCallback((u: GroupUser) => {
    setGroupMembers((prev) => [...prev, u]);
    setGroupSearchQuery("");
    setGroupSearchResults([]);
  }, []);

  const handleRemoveGroupMember = useCallback((userId: string) => {
    setGroupMembers((prev) => prev.filter((m) => m.id !== userId));
  }, []);

  const handleResetGroupForm = useCallback(() => {
    setShowCreateGroup(false);
    setGroupName("");
    setGroupMembers([]);
    setGroupSearchQuery("");
    setGroupSearchResults([]);
  }, []);

  const handleCreateGroup = useCallback(async () => {
    if (!groupName.trim() || groupMembers.length === 0 || creatingGroup) return;
    setCreatingGroup(true);
    try {
      const conv = await createGroup(groupName.trim(), groupMembers.map((m) => m.id));
      if (!conv) return;
      handleResetGroupForm();
      const updated = await loadConversations();
      const fresh = updated.find((c) => c.id === conv.id) ?? conv;
      selectConversation(fresh);
    } finally {
      setCreatingGroup(false);
    }
  }, [groupName, groupMembers, creatingGroup, loadConversations, selectConversation, handleResetGroupForm]);

  const handleLeaveGroup = useCallback(async (convId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = await leaveGroup(convId);
    if (!updated) return;
    setConversations((prev) =>
      sortConversations(prev.map((c) => (c.id === convId ? { ...c, ...updated, has_left: true } : c)))
    );
    setSelectedConversation((prev) =>
      prev?.id === convId ? { ...prev, ...updated, has_left: true } : prev
    );
  }, []);

  const handleToggleMuteConversation = useCallback(async (convId: string) => {
    const current = conversations.find((c) => c.id === convId);
    if (!current) return;
    const nextMuted = !current.is_muted;
    const ok = await muteConversation(convId, nextMuted);
    if (!ok) return;
    setConversations((prev) =>
      sortConversations(prev.map((c) => (c.id === convId ? { ...c, is_muted: nextMuted } : c)))
    );
    setSelectedConversation((prev) =>
      prev?.id === convId ? { ...prev, is_muted: nextMuted } : prev
    );
    void refreshUnread();
    // Re-sync from server so list order + is_muted stay consistent
    void loadConversations();
  }, [conversations, refreshUnread, loadConversations]);

  // ── Prepare conversation lists ────────────────────────────────────────────

  const privateConversations = conversations.filter(
    (c) => (c.type === "private" || !c.type) && c.last_message !== null
  );
  const groupConversations = conversations.filter((c) => c.type === "group");

  const selectedLegacy = selectedConversation
    ? toConversationInterface(
        selectedConversation,
        getDecryptedPreview(selectedConversation, decryptedPreviews)
      )
    : null;

  const isSendDisabled =
    sending ||
    Boolean(selectedConversation?.has_left) ||
    selectedConversation?.can_message === false ||
    (selectedConversation?.type !== "group" && !isReady);

  const messagingRestricted =
    selectedConversation?.type === "private" &&
    selectedConversation.can_message === false;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div
        className={cn(
          "flex w-full flex-col border-border/50 md:w-1/3 md:border-r",
          selectedConversation ? "hidden md:flex" : "flex"
        )}
      >
        <Tabs defaultValue="private" className="flex h-full flex-col">
          <div className="pt-3 sm:pt-4">
            <div className="mb-2 flex items-center gap-2 px-3 sm:px-4">
              <div className="min-w-0 flex-1">
                <ChatTabs />
              </div>
              <button
                onClick={() => { setShowNewConv((v) => !v); setSearchQuery(""); setSearchResults([]); }}
                className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors shrink-0"
                title="Nova conversa"
              >
                {showNewConv ? <XIcon className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
              </button>
            </div>
            {showNewConv && (
              <div className="space-y-1 px-3 pb-2 sm:px-4">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  placeholder="Buscar por username..."
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm outline-none focus:border-primary/50"
                />
                {searching && <p className="text-xs text-muted-foreground px-1">Buscando...</p>}
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartConversation(u.id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/60 text-sm transition-colors"
                  >
                    <span className="font-medium">{u.first_name} {u.last_name}</span>
                    <span className="text-muted-foreground ml-1">@{u.username}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Private conversations */}
          <TabsContent value="private" className="mt-0 p-0 flex-1 overflow-hidden">
            <ScrollArea style={{ height: listHeight }}>
              {privateConversations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma conversa ainda.
                </p>
              ) : (
                privateConversations.map((conv) => {
                  const item = toConversationInterface(
                    conv,
                    getDecryptedPreview(conv, decryptedPreviews)
                  );
                  return (
                    <div
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={cn(
                          "group cursor-pointer border-l-2 p-3 transition-colors hover:bg-muted/50 sm:p-4",
                          selectedConversation?.id === conv.id
                            ? "border-primary bg-primary/10"
                            : "border-transparent"
                        )}
                    >
                      <div className="flex items-center space-x-3">
                        <ConversationAvatar
                          name={item.name}
                          avatar={typeof item.avatar === "string" ? item.avatar || undefined : undefined}
                          unread={item.unread}
                          isMuted={item.isMuted}
                        />
                        <ConversationRowMeta
                          name={item.name}
                          lastMessage={item.lastMessage}
                          timestamp={item.timestamp}
                          isMuted={item.isMuted}
                          trailing={
                            <button
                              onClick={(e) => handleDeleteConversation(conv.id, e)}
                              className="flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                              title="Apagar conversa"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          }
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </ScrollArea>
          </TabsContent>

          {/* Group conversations */}
          <TabsContent value="group" className="mt-0 flex-1 overflow-hidden">
            <ScrollArea style={{ height: listHeight }}>
              {showCreateGroup ? (
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={handleResetGroupForm}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium">Novo grupo</span>
                  </div>
                  <input
                    autoFocus
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Nome do grupo"
                    className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm outline-none focus:border-primary/50"
                  />
                  <input
                    value={groupSearchQuery}
                    onChange={(e) => handleGroupSearchUsers(e.target.value)}
                    placeholder="Adicionar membros..."
                    className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm outline-none focus:border-primary/50"
                  />
                  {groupSearching && <p className="text-xs text-muted-foreground px-1">Buscando...</p>}
                  {groupSearchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleAddGroupMember(u)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/60 text-sm transition-colors"
                    >
                      <span className="font-medium">{u.first_name} {u.last_name}</span>
                      <span className="text-muted-foreground ml-1">@{u.username}</span>
                    </button>
                  ))}
                  {groupMembers.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Membros selecionados</p>
                      {groupMembers.map((m) => (
                        <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 text-sm">
                          <span>
                            {m.first_name} {m.last_name}
                            <span className="text-muted-foreground ml-1">@{m.username}</span>
                          </span>
                          <button
                            onClick={() => handleRemoveGroupMember(m.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <XIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={handleCreateGroup}
                    disabled={!groupName.trim() || groupMembers.length === 0 || creatingGroup}
                    className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  >
                    {creatingGroup ? "Criando..." : "Criar grupo"}
                  </button>
                </div>
              ) : (
                <>
                  {groupConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 gap-4">
                      <Users className="w-10 h-10 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground text-center">Nenhum grupo ainda.</p>
                      <button
                        onClick={() => setShowCreateGroup(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Criar grupo
                      </button>
                    </div>
                  ) : (
                    <>
                      {groupConversations.map((conv) => {
                        const item = toConversationInterface(conv, null);
                        return (
                          <div
                            key={conv.id}
                            onClick={() => selectConversation(conv)}
                            className={`group p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-2 ${
                              selectedConversation?.id === conv.id
                                ? "border-primary bg-primary/10"
                                : "border-transparent"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <ConversationAvatar
                                name={item.name}
                                unread={item.unread}
                                isMuted={item.isMuted}
                                isGroup
                              />
                              <ConversationRowMeta
                                name={item.name}
                                lastMessage={item.lastMessage}
                                timestamp={item.timestamp}
                                isMuted={item.isMuted}
                                hasLeft={item.hasLeft}
                                trailing={
                                  !conv.has_left ? (
                                    <button
                                      onClick={(e) => handleLeaveGroup(conv.id, e)}
                                      className="flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                                      title="Sair do grupo"
                                    >
                                      <LogOut className="h-3.5 w-3.5" />
                                    </button>
                                  ) : null
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                      <button
                        onClick={() => setShowCreateGroup(true)}
                        className="w-full p-4 text-primary text-sm flex items-center gap-2 hover:bg-muted/50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Criar novo grupo
                      </button>
                    </>
                  )}
                </>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat area */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col overflow-hidden",
          selectedConversation ? "flex" : "hidden md:flex"
        )}
      >
        {selectedConversation ? (
          <>
            <ChatHeader
              selectedConversation={selectedLegacy}
              onBack={clearSelectedConversation}
              onLeaveGroup={
                selectedConversation.type === "group" && !selectedConversation.has_left
                  ? () => handleLeaveGroup(selectedConversation.id)
                  : undefined
              }
              onToggleMuteConversation={() =>
                handleToggleMuteConversation(selectedConversation.id)
              }
              onDeleteConversation={() => handleDeleteConversation(selectedConversation.id)}
              onBlockUser={
                selectedConversation.type === "private"
                  ? () => handleBlockUser()
                  : undefined
              }
            />
            <ScrollArea className={chatHeight + " p-3 pt-2 sm:p-4 sm:pt-2"}>
              {loadingMessages ? (
                <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
              ) : (
                <ChatMessages messages={messages} />
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
            {selectedConversation.has_left ? (
              <div className="border-t border-border/50 bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
                Você saiu deste grupo. Ainda pode ver as mensagens antigas.
              </div>
            ) : messagingRestricted ? (
              <div className="border-t border-border/50 bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
                Você não pode enviar mensagens para este usuário devido às
                configurações de privacidade dele.
              </div>
            ) : (
              <InputMessage
                ref={inputRef}
                onInput={setMessageInput}
                messageInput={messageInput}
                onSend={handleSend}
                disabled={isSendDisabled}
                megaphoneReply={megaphoneReply}
                onDismissMegaphoneReply={() => setMegaphoneReply(null)}
              />
            )}
          </>
        ) : (
          <NoConversationSelected />
        )}
      </div>
    </div>
  );
}
