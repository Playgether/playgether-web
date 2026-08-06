"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, X as XIcon, Users, LogOut } from "lucide-react";
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
      unread: dm.unread_count || undefined,
      type: "group" as const,
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
    unread: dm.unread_count || undefined,
    type: "private" as const,
  };
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
  const { markRead } = useDMUnread();

  const [conversations, setConversations] = useState<DMConversation[]>([]);
  const [decryptedPreviews, setDecryptedPreviews] = useState<Record<string, string>>({});
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

  // ── Load conversations ────────────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    const data = await getConversations();
    setConversations(data);
    return data;
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Decrypt last-message previews (private DMs only) ─────────────────────

  useEffect(() => {
    if (!isReady) return;
    conversations.forEach(async (conv) => {
      if (conv.type === "group") return;
      if (!conv.last_message) return;
      if (decryptedPreviews[conv.id]) return;
      const msg = conv.last_message;
      if (!msg.encrypted_body || !msg.encrypted_key_recipient || !msg.iv) return;
      const isSender = msg.sender_id === user?.user_id;
      const plain = await decrypt(
        msg.encrypted_body,
        msg.encrypted_key_recipient,
        msg.iv,
        isSender,
        msg.encrypted_key_sender
      );
      if (plain) {
        const shared = decodeSharedContent(plain);
        setDecryptedPreviews((prev) => ({
          ...prev,
          [conv.id]: shared ? sharedContentPreviewText(shared) : plain,
        }));
      }
    });
  }, [conversations, isReady, decrypt, user, decryptedPreviews]);

  // ── Select conversation → load history ───────────────────────────────────

  const selectConversation = useCallback(
    async (conv: DMConversation) => {
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
            msg.encrypted_key_sender
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
    },
    [isReady, decrypt, user]
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
          msg.encrypted_key_sender
        );
        content = plain ?? "🔒 Não foi possível decifrar";
      }

      const shared = decodeSharedContent(content);
      const ui: MessageInterface = {
        id: msg.id,
        sender: msg.sender_username,
        content: shared ? sharedContentPreviewText(shared) : content,
        sharedContent: shared ?? undefined,
        timestamp: new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: isSender,
      };

      setMessages((prev) => [...prev, ui]);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversation_id
            ? { ...c, last_message: msg, updated_at: msg.timestamp }
            : c
        )
      );
      if (msg.body) {
        // no decrypted preview needed for group messages
      } else if (ui.content) {
        setDecryptedPreviews((prev) => ({
          ...prev,
          [msg.conversation_id ?? ""]: ui.content,
        }));
      }
    },
    [decrypt, user]
  );

  const { sendEncryptedMessage, sendGroupMessage } = useDMWebSocket({
    conversationId: selectedConversation?.id ?? null,
    onNewMessage: handleNewMessage,
  });

  useDMNotifications({
    onNotification: useCallback((convId: string) => {
      if (convId === selectedConversation?.id) return;
      loadConversations();
    }, [selectedConversation?.id, loadConversations]),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const typed = messageInput.trim();
    if (!typed || !selectedConversation || sending) return;

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

  const handleDeleteConversation = useCallback(async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await deleteConversation(convId);
    if (!ok) return;
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (selectedConversation?.id === convId) setSelectedConversation(null);
  }, [selectedConversation]);

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

  const handleLeaveGroup = useCallback(async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await leaveGroup(convId);
    if (!ok) return;
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (selectedConversation?.id === convId) setSelectedConversation(null);
  }, [selectedConversation]);

  // ── Prepare conversation lists ────────────────────────────────────────────

  const privateConversations = conversations.filter(
    (c) => (c.type === "private" || !c.type) && c.last_message !== null
  );
  const groupConversations = conversations.filter((c) => c.type === "group");

  const selectedLegacy = selectedConversation
    ? toConversationInterface(selectedConversation, decryptedPreviews[selectedConversation.id] ?? null)
    : null;

  const isSendDisabled =
    sending ||
    (selectedConversation?.type !== "group" && !isReady);

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
                  const item = toConversationInterface(conv, decryptedPreviews[conv.id] ?? null);
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
                        <ProfileAvatar
                          displayName={item.name}
                          profilePhoto={typeof item.avatar === "string" ? item.avatar || null : null}
                          sizeClass="h-9 w-9"
                          fallbackTextClassName="text-xs"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.lastMessage}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleDeleteConversation(conv.id, e)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded hover:text-destructive"
                              title="Apagar conversa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                          </div>
                          {(item.unread ?? 0) > 0 && (
                            <span className="w-5 h-5 rounded-full bg-gradient-secondary flex items-center justify-center text-xs text-white font-bold">
                              {item.unread}
                            </span>
                          )}
                        </div>
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
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <Users className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{item.lastMessage || "Sem mensagens"}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => handleLeaveGroup(conv.id, e)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded hover:text-destructive"
                                    title="Sair do grupo"
                                  >
                                    <LogOut className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                                </div>
                                {(item.unread ?? 0) > 0 && (
                                  <span className="w-5 h-5 rounded-full bg-gradient-secondary flex items-center justify-center text-xs text-white font-bold">
                                    {item.unread}
                                  </span>
                                )}
                              </div>
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
              onBack={() => setSelectedConversation(null)}
            />
            <ScrollArea className={chatHeight + " p-3 pt-2 sm:p-4 sm:pt-2"}>
              {loadingMessages ? (
                <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
              ) : (
                <ChatMessages messages={messages} />
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
            <InputMessage
              ref={inputRef}
              onInput={setMessageInput}
              messageInput={messageInput}
              onSend={handleSend}
              disabled={isSendDisabled}
              megaphoneReply={megaphoneReply}
              onDismissMegaphoneReply={() => setMegaphoneReply(null)}
            />
          </>
        ) : (
          <NoConversationSelected />
        )}
      </div>
    </div>
  );
}
