"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lock, Plus, Trash2, X as XIcon } from "lucide-react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import InputMessage from "./InputMessage";
import ChatTabs from "./ChatTabs";
import NoConversationSelected from "./NoConversationSelected";
import NoImageClan from "./NoImageClan";
import NoImageGroup from "./NoImageGroup";
import { useE2ECrypto } from "@/context/E2ECryptoContext";
import { useAuthContext } from "@/context/AuthContext";
import { useDMWebSocket } from "@/hooks/useDMWebSocket";
import { useDMNotifications } from "@/hooks/useDMNotifications";
import { useDMUnread } from "@/context/DMUnreadContext";
import {
  deleteConversation,
  getConversations,
  getMessages,
  markConversationRead,
  startConversation,
  type DMConversation,
  type DMMessage,
} from "@/services/directMessages";
import { api } from "@/services/api";
import type { ConversationInterface } from "../../types/chat/ConversationInterface";
import type { MessageInterface } from "../../types/chat/MessageInterface";
import { resolvePlaygetherMediaUrl } from "@/lib/resolvePlaygetherMediaUrl";


interface ConversationsContentProps {
  listHeight?: string;
  chatHeight?: string;
  autoOpenId?: string;
}

// Map a DMConversation to the legacy ConversationInterface expected by sub-components
function toConversationInterface(
  dm: DMConversation,
  decryptedPreview: string | null
): ConversationInterface {
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
}: ConversationsContentProps) {
  const { user } = useAuthContext();
  const { isReady, needsUnlock, unlock, regenerateKeys, encryptForUser, decrypt } = useE2ECrypto();
  const { markRead } = useDMUnread();

  const [conversations, setConversations] = useState<DMConversation[]>([]);
  const [decryptedPreviews, setDecryptedPreviews] = useState<Record<string, string>>({});
  const [selectedConversation, setSelectedConversation] = useState<DMConversation | null>(null);
  const autoOpenedRef = useRef(false);

  // Messages for the selected conversation — decrypted
  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [rawMessages, setRawMessages] = useState<DMMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Unlock overlay
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockError, setUnlockError] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState(false);

  // New conversation search
  const [showNewConv, setShowNewConv] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; username: string; first_name: string; last_name: string }[]>([]);
  const [searching, setSearching] = useState(false);

  const seenIdsRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Load conversations ────────────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    const data = await getConversations();
    setConversations(data);
    return data;
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Decrypt last-message previews ─────────────────────────────────────────

  useEffect(() => {
    if (!isReady) return;
    conversations.forEach(async (conv) => {
      if (!conv.last_message) return;
      if (decryptedPreviews[conv.id]) return;
      const msg = conv.last_message;
      const isSender = msg.sender_id === user?.user_id;
      const plain = await decrypt(
        msg.encrypted_body,
        msg.encrypted_key_recipient,
        msg.iv,
        isSender,
        msg.encrypted_key_sender
      );
      if (plain) {
        setDecryptedPreviews((prev) => ({ ...prev, [conv.id]: plain }));
      }
    });
  }, [conversations, isReady, decrypt, user, decryptedPreviews]);

  // ── Select conversation → load history ───────────────────────────────────

  const selectConversation = useCallback(
    async (conv: DMConversation) => {
      setSelectedConversation(conv);
      setMessages([]);
      setRawMessages([]);
      seenIdsRef.current.clear();
      if (!isReady) return;

      setLoadingMessages(true);
      const { results } = await getMessages(conv.id);
      // CursorPagination retorna -timestamp (mais novo primeiro); reverter para exibir do mais antigo
      const sorted = [...results].reverse();
      setRawMessages(sorted);

      const decrypted: MessageInterface[] = [];
      for (const msg of sorted) {
        if (seenIdsRef.current.has(msg.id)) continue;
        seenIdsRef.current.add(msg.id);
        const isSender = msg.sender_id === user?.user_id;
        const plain = await decrypt(
          msg.encrypted_body,
          msg.encrypted_key_recipient,
          msg.iv,
          isSender,
          msg.encrypted_key_sender
        );
        decrypted.push({
          id: msg.id,
          sender: msg.sender_username,
          content: plain ?? "🔒 Não foi possível decifrar",
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
      // Limpar badge localmente sem esperar re-fetch
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

  // ── WebSocket: receive new messages ──────────────────────────────────────

  const handleNewMessage = useCallback(
    async (msg: DMMessage) => {
      if (seenIdsRef.current.has(msg.id)) return;
      seenIdsRef.current.add(msg.id);

      const isSender = msg.sender_id === user?.user_id;
      const plain = await decrypt(
        msg.encrypted_body,
        msg.encrypted_key_recipient,
        msg.iv,
        isSender,
        msg.encrypted_key_sender
      );

      const ui: MessageInterface = {
        id: msg.id,
        sender: msg.sender_username,
        content: plain ?? "🔒 Não foi possível decifrar",
        timestamp: new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: isSender,
      };

      setMessages((prev) => [...prev, ui]);

      // Update conversation preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversation_id
            ? { ...c, last_message: msg, updated_at: msg.timestamp }
            : c
        )
      );
      if (plain) {
        setDecryptedPreviews((prev) => ({
          ...prev,
          [msg.conversation_id ?? ""]: plain,
        }));
      }
    },
    [decrypt, user]
  );

  const { sendEncryptedMessage } = useDMWebSocket({
    conversationId: selectedConversation?.id ?? null,
    onNewMessage: handleNewMessage,
  });

  // Notificações globais — recarrega lista quando chega mensagem de outra conversa
  useDMNotifications({
    onNotification: useCallback((convId: string) => {
      // Se a notificação é da conversa aberta, o WebSocket da conversa já cuida
      if (convId === selectedConversation?.id) return;
      loadConversations();
    }, [selectedConversation?.id, loadConversations]),
  });

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = messageInput.trim();
    if (!text || !selectedConversation || !isReady || sending) return;

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
    } finally {
      setSending(false);
    }
  }, [messageInput, selectedConversation, isReady, sending, encryptForUser, sendEncryptedMessage]);

  // ── Unlock handler ────────────────────────────────────────────────────────

  const handleSearchUsers = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await api.get(`/api/v1/users/?search=${encodeURIComponent(q)}`, { withCredentials: true });
      const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
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

  const handleUnlock = useCallback(async () => {
    if (!unlockPassword) return;
    setUnlocking(true);
    setUnlockError(false);
    const ok = await unlock(unlockPassword);
    setUnlocking(false);
    if (!ok) {
      setUnlockError(true);
    } else {
      setUnlockPassword("");
      loadConversations();
    }
  }, [unlockPassword, unlock, loadConversations]);

  const handleRegenerate = useCallback(async () => {
    if (!unlockPassword) return;
    setRegenerating(true);
    setRegenError(false);
    const ok = await regenerateKeys(unlockPassword);
    setRegenerating(false);
    if (!ok) {
      setRegenError(true);
    } else {
      setUnlockPassword("");
      setShowRegenConfirm(false);
      loadConversations();
    }
  }, [unlockPassword, regenerateKeys, loadConversations]);

  // ── Prepare conversation list for sub-components ──────────────────────────

  // Apenas conversas com pelo menos uma mensagem aparecem na lista
  const visibleConversations = conversations.filter((c) => c.last_message !== null);
  const conversationItems: ConversationInterface[] = visibleConversations.map((c) =>
    toConversationInterface(c, decryptedPreviews[c.id] ?? null)
  );

  // ── Render: unlock panel (inline, dentro da área do chat) ───────────────

  const unlockPanel = (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-8">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Lock className="w-6 h-6 text-primary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold">Mensagens criptografadas</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Digite a <strong>senha da sua conta</strong> para desbloquear as mensagens desta sessão.
        </p>
      </div>
      <input
        type="password"
        value={unlockPassword}
        onChange={(e) => { setUnlockPassword(e.target.value); setUnlockError(false); setRegenError(false); }}
        placeholder="Senha da conta"
        className="w-full max-w-xs px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm outline-none focus:border-primary/50"
        onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
      />
      {unlockError && (
        <p className="text-xs text-destructive text-center">
          Senha incorreta. Tente novamente.
        </p>
      )}
      <button
        onClick={handleUnlock}
        disabled={unlocking || !unlockPassword}
        className="w-full max-w-xs py-2 rounded-lg bg-gradient-primary text-white text-sm font-semibold disabled:opacity-50"
      >
        {unlocking ? "Desbloqueando..." : "Desbloquear"}
      </button>

      {/* Regenerate keys option */}
      {!showRegenConfirm ? (
        <button
          onClick={() => setShowRegenConfirm(true)}
          className="text-xs text-muted-foreground hover:text-primary transition-colors mt-1"
        >
          Esqueci a senha / Recriar chaves
        </button>
      ) : (
        <div className="w-full max-w-xs space-y-2 border border-destructive/30 rounded-lg p-3 bg-destructive/5">
          <p className="text-xs text-destructive font-medium text-center">
            ⚠️ Atenção
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Isso irá recriar suas chaves de criptografia usando a senha digitada acima.
            Mensagens anteriores não poderão ser lidas.
          </p>
          {regenError && (
            <p className="text-xs text-destructive text-center">Erro ao recriar chaves. Tente novamente.</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => { setShowRegenConfirm(false); setRegenError(false); }}
              className="flex-1 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50"
            >
              Cancelar
            </button>
            <button
              onClick={handleRegenerate}
              disabled={regenerating || !unlockPassword}
              className="flex-1 py-1.5 rounded-lg bg-destructive text-white text-xs font-semibold disabled:opacity-50"
            >
              {regenerating ? "Recriando..." : "Confirmar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ── Render: main layout ───────────────────────────────────────────────────

  const selectedLegacy = selectedConversation
    ? toConversationInterface(selectedConversation, decryptedPreviews[selectedConversation.id] ?? null)
    : null;

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div className="w-1/3 border-r border-border/50 flex flex-col">
        <Tabs defaultValue="private" className="h-full flex flex-col">
          <div className="pt-4">
            <div className="flex items-center px-4 mb-2 gap-2">
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
              <div className="px-4 pb-2 space-y-1">
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
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/30 text-sm transition-colors"
                  >
                    <span className="font-medium">{u.first_name} {u.last_name}</span>
                    <span className="text-muted-foreground ml-1">@{u.username}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <TabsContent value="private" className="mt-0 p-0 flex-1 overflow-hidden">
            <ScrollArea style={{ height: listHeight }}>
              {conversationItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma conversa ainda.
                </p>
              ) : (
                visibleConversations.map((conv) => {
                    const item = toConversationInterface(conv, decryptedPreviews[conv.id] ?? null);
                    return (
                      <div
                        key={conv.id}
                        onClick={() => selectConversation(conv)}
                        className={`group p-4 cursor-pointer hover:bg-muted/20 transition-colors border-l-2 ${
                          selectedConversation?.id === conv.id
                            ? "border-primary bg-primary/10"
                            : "border-transparent"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
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

          <TabsContent value="clan" className="mt-0 flex-1 overflow-hidden">
            <ScrollArea style={{ height: listHeight }}>
              <NoImageClan />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="group" className="mt-0 flex-1 overflow-hidden">
            <ScrollArea style={{ height: listHeight }}>
              <NoImageGroup />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            <ChatHeader selectedConversation={selectedLegacy} />
            {!isReady ? (
              needsUnlock ? unlockPanel : (
                <div className="flex flex-col items-center justify-center flex-1 gap-3 px-8 text-center">
                  <Lock className="w-8 h-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Criptografia E2E não configurada para esta conta.
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Faça logout e cadastre-se novamente para ativar as mensagens seguras.
                  </p>
                </div>
              )
            ) : (
              <>
                <ScrollArea className={chatHeight + " p-4 pt-2"}>
                  {loadingMessages ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
                  ) : (
                    <ChatMessages messages={messages} />
                  )}
                  <div ref={messagesEndRef} />
                </ScrollArea>
                <InputMessage
                  onInput={setMessageInput}
                  messageInput={messageInput}
                  onSend={handleSend}
                  disabled={sending}
                />
              </>
            )}
          </>
        ) : needsUnlock && !isReady ? unlockPanel : (
          <NoConversationSelected />
        )}
      </div>
    </div>
  );
}
