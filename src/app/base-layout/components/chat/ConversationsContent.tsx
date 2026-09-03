"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, X as XIcon, Users, LogOut, VolumeX, ChevronLeft, Inbox, ShieldAlert } from "lucide-react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import InputMessage from "./InputMessage";
import ChatTabs from "./ChatTabs";
import NoConversationSelected from "./NoConversationSelected";
import { KeySafetyDialog } from "./KeySafetyDialog";
import { useE2ECrypto } from "@/context/E2ECryptoContext";
import { useAuthContext } from "@/context/AuthContext";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { useDMWebSocket, type DMMessageStatusEvent } from "@/hooks/useDMWebSocket";
import { useDMNotifications } from "@/hooks/useDMNotifications";
import { useDMUnread } from "@/context/DMUnreadContext";
import {
  acceptMessageRequest,
  createGroup,
  deleteConversation,
  getConversations,
  getMessages,
  getUserPublicKey,
  leaveGroup,
  markConversationRead,
  markMessagesDelivered,
  muteConversation,
  startConversation,
  type DMConversation,
  type DMMessage,
} from "@/services/directMessages";
import type { ConversationInterface } from "../../types/chat/ConversationInterface";
import type {
  MessageDeliveryStatus,
  MessageInterface,
} from "../../types/chat/MessageInterface";
import { resolvePlaygetherMediaUrl } from "@/lib/resolvePlaygetherMediaUrl";
import { CustomToast } from "@/components/ui/customSonner";
import {
  decodeSharedContent,
  sharedContentPreviewText,
} from "@/lib/sharedContent";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import type { MegaphoneReplyDraft } from "@/context/ConversationsWidgetContext";
import {
  formatDuoFinderMessage,
  type DuoReplyDraft,
} from "@/lib/duoFinderMessage";
import {
  evaluateKeyTrust,
  trustPublicKeyFingerprint,
  type KeyTrustResult,
} from "@/lib/e2eKeyTrust";

interface ConversationsContentProps {
  listHeight?: string;
  chatHeight?: string;
  autoOpenId?: string;
  forceSelectId?: string;
  forceDraft?: string;
  forceMegaphoneReply?: MegaphoneReplyDraft;
  forceDuoReply?: DuoReplyDraft;
}

function resolveDeliveryStatus(
  msg: Pick<DMMessage, "is_read" | "delivered_at">,
  isOwn: boolean,
  showDeliveryStatus: boolean,
  showReadReceipts: boolean,
): MessageDeliveryStatus | undefined {
  if (!isOwn || !showDeliveryStatus) return undefined;
  if (showReadReceipts && msg.is_read) return "read";
  if (msg.delivered_at) return "delivered";
  return "sent";
}

function shouldShowDeliveryStatus(
  conv: Pick<DMConversation, "type" | "status"> | null | undefined,
): boolean {
  if (!conv) return false;
  if (conv.type === "group") return true;
  return conv.status !== "pending";
}

async function dmMessageToUi(
  msg: DMMessage,
  userId: string | undefined,
  decryptFn: (
    encryptedBody: string,
    encryptedKey: string,
    iv: string,
    isSender: boolean,
    encryptedKeySender: string,
  ) => Promise<string | null>,
  showDeliveryStatus: boolean,
  showReadReceipts: boolean,
): Promise<MessageInterface> {
  const isSender = msg.sender_id === userId;

  let content: string;
  if (msg.body) {
    content = msg.body;
  } else {
    const plain = await decryptFn(
      msg.encrypted_body!,
      msg.encrypted_key_recipient!,
      msg.iv!,
      isSender,
      msg.encrypted_key_sender ?? "",
    );
    content = plain ?? "🔒 Não foi possível decifrar";
  }

  const shared = decodeSharedContent(content);
  return {
    id: msg.id,
    sender: msg.sender_username,
    content: shared ? sharedContentPreviewText(shared) : content,
    sharedContent: shared ?? undefined,
    timestamp: new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isOwn: isSender,
    deliveryStatus: resolveDeliveryStatus(
      msg,
      isSender,
      showDeliveryStatus,
      showReadReceipts,
    ),
  };
}

function toConversationInterface(
  dm: DMConversation,
  decryptedPreview: string | null,
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
  const canViewProfile = other?.can_view_profile !== false;
  return {
    id: dm.id,
    name: other
      ? `${other.first_name} ${other.last_name}`.trim() || other.username
      : "?",
    avatar: canViewProfile
      ? resolvePlaygetherMediaUrl(other?.profile_photo) || ""
      : "",
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
    canViewProfile,
    canMessageReason: dm.can_message_reason ?? null,
  };
}

function getDecryptedPreview(
  conv: DMConversation,
  previews: Record<string, { messageId: string; text: string }>,
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
          : "bg-gradient-secondary text-white",
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
            <span className="shrink-0 text-[10px] text-muted-foreground">
              Saiu
            </span>
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

function PrivateConversationRow({
  conv,
  decryptedPreviews,
  selectedId,
  onSelect,
  onDelete,
  subtitle,
}: {
  conv: DMConversation;
  decryptedPreviews: Record<string, { messageId: string; text: string }>;
  selectedId?: string;
  onSelect: (conv: DMConversation) => void;
  onDelete: (convId: string, e?: React.MouseEvent) => void;
  subtitle?: string;
}) {
  const item = toConversationInterface(
    conv,
    getDecryptedPreview(conv, decryptedPreviews),
  );
  return (
    <div
      key={conv.id}
      onClick={() => onSelect(conv)}
      className={cn(
        "group cursor-pointer border-l-2 p-3 transition-colors hover:bg-muted/50 sm:p-4",
        selectedId === conv.id
          ? "border-primary bg-primary/10"
          : "border-transparent",
      )}
    >
      <div className="flex items-center space-x-3">
        <ConversationAvatar
          name={item.name}
          avatar={(typeof item.avatar === "string" ? item.avatar : item.avatar.src) || undefined}
          unread={item.unread}
          isMuted={item.isMuted}
        />
        <ConversationRowMeta
          name={item.name}
          lastMessage={subtitle ?? item.lastMessage}
          timestamp={item.timestamp}
          isMuted={item.isMuted}
          trailing={
            <button
              onClick={(e) => onDelete(conv.id, e)}
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
}

export function ConversationsContent({
  listHeight = "calc(100% - 120px)",
  chatHeight = "flex-1",
  autoOpenId,
  forceSelectId,
  forceDraft,
  forceMegaphoneReply,
  forceDuoReply,
}: ConversationsContentProps) {
  const { user } = useAuthContext();
  const { prefs } = useUserPreferences();
  const userSharesReceipts = prefs?.show_read_receipts ?? true;
  const { isReady, needsUnlock, encryptForUser, decrypt } = useE2ECrypto();
  const { markRead, refresh: refreshUnread } = useDMUnread();

  const [conversations, setConversations] = useState<DMConversation[]>([]);
  /** Preview decriptado por conversa, amarrado ao id da last_message. */
  const [decryptedPreviews, setDecryptedPreviews] = useState<
    Record<string, { messageId: string; text: string }>
  >({});
  const [selectedConversation, setSelectedConversation] =
    useState<DMConversation | null>(null);
  const autoOpenedRef = useRef(false);

  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [rawMessages, setRawMessages] = useState<DMMessage[]>([]);
  /** Conversation id whose `rawMessages` finished loading (null while fetching). */
  const [historyConvId, setHistoryConvId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [megaphoneReply, setMegaphoneReply] =
    useState<MegaphoneReplyDraft | null>(null);
  const [duoReply, setDuoReply] = useState<DuoReplyDraft | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // New private conversation search
  const [showNewConv, setShowNewConv] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: string; username: string; first_name: string; last_name: string }[]
  >([]);
  const [searching, setSearching] = useState(false);

  // Group creation
  type GroupUser = {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [groupSearchResults, setGroupSearchResults] = useState<GroupUser[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupUser[]>([]);
  const [groupSearching, setGroupSearching] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [acceptingRequest, setAcceptingRequest] = useState(false);
  const [excludingRequest, setExcludingRequest] = useState(false);
  const [blockingRequest, setBlockingRequest] = useState(false);
  const [activeTab, setActiveTab] = useState("private");
  const [peerKeyTrust, setPeerKeyTrust] = useState<KeyTrustResult | null>(null);
  const [safetyDialogOpen, setSafetyDialogOpen] = useState(false);

  const seenIdsRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevForceSelectRef = useRef<string | undefined>(undefined);
  const selectedIdRef = useRef<string | null>(null);
  const showDeliveryRef = useRef(false);
  const showReadReceiptsRef = useRef(true);
  const historyVersionRef = useRef(0);
  const rawMessagesRef = useRef<DMMessage[]>([]);
  rawMessagesRef.current = rawMessages;

  // ── Load conversations ────────────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    const data = await getConversations();
    const selectedId = selectedIdRef.current;
    const sorted = sortConversations(
      data.map((c) => (c.id === selectedId ? { ...c, unread_count: 0 } : c)),
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
      if (!msg.encrypted_body || !msg.encrypted_key_recipient || !msg.iv)
        return;

      // Já temos o plaintext desta last_message — não reprocessa
      const cached = decryptedPreviews[conv.id];
      if (cached?.messageId === msg.id) return;

      const isSender = msg.sender_id === user?.user_id;
      const plain = await decrypt(
        msg.encrypted_body,
        msg.encrypted_key_recipient,
        msg.iv,
        isSender,
        msg.encrypted_key_sender ?? "",
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
      showDeliveryRef.current = shouldShowDeliveryStatus(conv);
      showReadReceiptsRef.current = userSharesReceipts;
      setSelectedConversation(conv);
      setMessages([]);
      setRawMessages([]);
      setHistoryConvId(null);
      setMegaphoneReply(null);
      setPeerKeyTrust(null);
      setSafetyDialogOpen(false);
      seenIdsRef.current.clear();

      setLoadingMessages(true);
      const { results } = await getMessages(conv.id);
      if (selectedIdRef.current !== conv.id) return;

      const sorted = [...results].reverse();
      for (const msg of sorted) {
        seenIdsRef.current.add(msg.id);
      }
      // Decryption runs in the effect below once E2E keys are ready (private)
      // or immediately for plaintext groups.
      setRawMessages(sorted);
      setHistoryConvId(conv.id);

      const unreadBefore = conv.unread_count ?? 0;
      markConversationRead(conv.id);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c)),
      );
      if (unreadBefore > 0) markRead(unreadBefore);
      else void refreshUnread();
    },
    [markRead, refreshUnread, user?.user_id, userSharesReceipts],
  );

  useEffect(() => {
    showDeliveryRef.current = shouldShowDeliveryStatus(selectedConversation);
    showReadReceiptsRef.current = userSharesReceipts;
  }, [selectedConversation?.status, selectedConversation?.type, userSharesReceipts]);

  const refreshMessagesForConversation = useCallback(
    async (convId: string, showDeliveryStatus = showDeliveryRef.current) => {
      const { results } = await getMessages(convId);
      if (selectedIdRef.current !== convId) return;

      const sorted = [...results].reverse();
      for (const msg of sorted) {
        seenIdsRef.current.add(msg.id);
      }
      setRawMessages(sorted);

      const decrypted: MessageInterface[] = [];
      for (const msg of sorted) {
        decrypted.push(
          await dmMessageToUi(
            msg,
            user?.user_id,
            decrypt,
            showDeliveryStatus,
            showReadReceiptsRef.current,
          ),
        );
        if (selectedIdRef.current !== convId) return;
      }
      setMessages(decrypted);
      historyVersionRef.current += 1;
    },
    [decrypt, user?.user_id],
  );

  // Decrypt loaded history when keys are ready (avoids "não foi possível decifrar"
  // if the conversation was opened before IndexedDB/session unlock finished).
  // Intentionally depends on historyConvId/isReady — not every live rawMessages append.
  useEffect(() => {
    if (!selectedConversation) return;
    if (historyConvId !== selectedConversation.id) return;
    const needsE2E = selectedConversation.type !== "group";
    if (needsE2E && !isReady) return;

    let cancelled = false;
    const conversationId = selectedConversation.id;
    const versionAtStart = historyVersionRef.current;

    void (async () => {
      const showDeliveryStatus = shouldShowDeliveryStatus(selectedConversation);
      const decrypted: MessageInterface[] = [];
      for (const msg of rawMessagesRef.current) {
        decrypted.push(
          await dmMessageToUi(
            msg,
            user?.user_id,
            decrypt,
            showDeliveryStatus,
            userSharesReceipts,
          ),
        );
        if (cancelled || selectedIdRef.current !== conversationId) return;
      }
      if (
        cancelled ||
        selectedIdRef.current !== conversationId ||
        historyVersionRef.current !== versionAtStart
      ) {
        return;
      }
      setMessages(decrypted);
      setLoadingMessages(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    historyConvId,
    isReady,
    selectedConversation?.id,
    selectedConversation?.type,
    selectedConversation?.status,
    userSharesReceipts,
    decrypt,
    user?.user_id,
  ]);

  // TOFU: evaluate peer public key when a private conversation is selected
  useEffect(() => {
    if (!selectedConversation || selectedConversation.type === "group") {
      setPeerKeyTrust(null);
      return;
    }

    const peerId = selectedConversation.other_participant?.id;
    if (!peerId) {
      setPeerKeyTrust(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      let publicKey = selectedConversation.other_participant?.public_key ?? null;
      if (!publicKey) {
        publicKey = await getUserPublicKey(peerId);
      }
      if (cancelled) return;

      const result = await evaluateKeyTrust(peerId, publicKey);
      if (cancelled) return;

      // Silent TOFU on first contact — no password / no modal
      if (result.status === "new" && result.fingerprint) {
        trustPublicKeyFingerprint(peerId, result.fingerprint);
        setPeerKeyTrust({ ...result, status: "trusted" });
        return;
      }
      setPeerKeyTrust(result);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    selectedConversation?.id,
    selectedConversation?.type,
    selectedConversation?.other_participant?.id,
    selectedConversation?.other_participant?.public_key,
  ]);

  const handleConfirmPeerKeyTrust = useCallback(() => {
    const peerId = selectedConversation?.other_participant?.id;
    const fp = peerKeyTrust?.fingerprint;
    if (!peerId || !fp) return;
    trustPublicKeyFingerprint(peerId, fp);
    setPeerKeyTrust((prev) =>
      prev ? { ...prev, status: "trusted", previousFingerprint: fp } : prev,
    );
  }, [selectedConversation?.other_participant?.id, peerKeyTrust?.fingerprint]);

  // Auto-open a specific conversation when navigated from a profile
  useEffect(() => {
    if (!autoOpenId || autoOpenedRef.current || conversations.length === 0)
      return;
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
      if (target.is_incoming_request) {
        setActiveTab("requests");
      }
      await selectConversation(target);
      if (forceMegaphoneReply) {
        setMegaphoneReply(forceMegaphoneReply);
        setDuoReply(null);
        setMessageInput("");
      } else if (forceDuoReply) {
        setDuoReply(forceDuoReply);
        setMegaphoneReply(null);
        setMessageInput("");
      } else if (forceDraft) {
        setMessageInput(forceDraft);
      }
      setTimeout(() => inputRef.current?.focus(), 150);
    });
  }, [
    forceSelectId,
    forceDraft,
    forceMegaphoneReply,
    forceDuoReply,
    loadConversations,
    selectConversation,
  ]);

  const markConversationUnlocked = useCallback(
    (convId: string) => {
      const patch = {
        status: "active" as const,
        is_incoming_request: false,
      };
      showDeliveryRef.current = shouldShowDeliveryStatus({
        type: "private",
        status: "active",
      });
      showReadReceiptsRef.current = userSharesReceipts;
      setConversations((prev) =>
        sortConversations(
          prev.map((c) => (c.id === convId ? { ...c, ...patch } : c)),
        ),
      );
      setSelectedConversation((prev) =>
        prev?.id === convId ? { ...prev, ...patch } : prev,
      );
      if (showReadReceiptsRef.current) {
        setMessages((prev) =>
          prev.map((m) =>
            m.isOwn ? { ...m, deliveryStatus: "read" as const } : m,
          ),
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.isOwn && m.deliveryStatus !== "sent"
              ? { ...m, deliveryStatus: "delivered" as const }
              : m,
          ),
        );
      }
      if (selectedIdRef.current === convId) {
        void refreshMessagesForConversation(convId, true);
      }
    },
    [refreshMessagesForConversation, userSharesReceipts],
  );

  // ── WebSocket: receive new messages ──────────────────────────────────────

  const handleNewMessage = useCallback(
    async (msg: DMMessage) => {
      if (seenIdsRef.current.has(msg.id)) return;
      seenIdsRef.current.add(msg.id);

      const isSender = msg.sender_id === user?.user_id;
      let unlockedConversation = false;
      const ui = await dmMessageToUi(
        msg,
        user?.user_id,
        decrypt,
        showDeliveryRef.current,
        showReadReceiptsRef.current,
      );
      const displayText = ui.content;

      setMessages((prev) => [...prev, ui]);
      setRawMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
      );

      setConversations((prev) =>
        sortConversations(
          prev.map((c) => {
            if (c.id !== msg.conversation_id) return c;
            // Outgoing request only: if the other person already has messages,
            // the thread was accepted server-side (local status may be stale).
            // Never treat the requester's own request messages as "accepted".
            const unlocked =
              !isSender &&
              c.status === "pending" &&
              !c.is_incoming_request
                ? { status: "active" as const, is_incoming_request: false }
                : null;
            if (unlocked) {
              unlockedConversation = true;
            }
            return {
              ...c,
              ...unlocked,
              last_message: msg,
              updated_at: msg.timestamp,
              // Está com a conversa aberta → não acumula unread
              unread_count: isSender ? c.unread_count : 0,
            };
          }),
        ),
      );

      if (unlockedConversation && msg.conversation_id) {
        markConversationUnlocked(msg.conversation_id);
      } else if (!isSender && msg.conversation_id) {
        setSelectedConversation((prev) => {
          if (!prev || prev.id !== msg.conversation_id) return prev;
          if (prev.status !== "pending" || prev.is_incoming_request) return prev;
          return {
            ...prev,
            status: "active",
            is_incoming_request: false,
          };
        });
      }

      if (msg.conversation_id && displayText) {
        setDecryptedPreviews((prev) => ({
          ...prev,
          [msg.conversation_id!]: { messageId: msg.id, text: displayText },
        }));
      }

      if (!isSender && msg.conversation_id) {
        void markConversationRead(msg.conversation_id);
      }

      if (!isSender && msg.conversation_id) {
        setConversations((prev) => {
          const conv = prev.find((c) => c.id === msg.conversation_id);
          if (conv?.status === "active") {
            void markMessagesDelivered(msg.conversation_id!, [msg.id]);
          }
          return prev;
        });
      }
    },
    [decrypt, user?.user_id, markConversationUnlocked],
  );

  const handleMessageStatus = useCallback((event: DMMessageStatusEvent) => {
    if (!showDeliveryRef.current) return;
    setRawMessages((prev) =>
      prev.map((m) => {
        if (m.id !== event.message_id) return m;
        return {
          ...m,
          delivered_at: event.delivered_at ?? m.delivered_at,
          is_read:
            showReadReceiptsRef.current && event.is_read != null
              ? event.is_read
              : m.is_read,
        };
      }),
    );
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== event.message_id || !m.isOwn) return m;
        let deliveryStatus: MessageDeliveryStatus = "sent";
        if (showReadReceiptsRef.current && event.is_read) deliveryStatus = "read";
        else if (event.delivered_at || m.deliveryStatus === "delivered" || m.deliveryStatus === "read") {
          deliveryStatus = "delivered";
        }
        return { ...m, deliveryStatus };
      }),
    );
  }, []);

  const applyBlockedByOther = useCallback((conversationId: string, reason?: string | null) => {
    const patch = (conv: DMConversation): DMConversation => {
      if (conv.id !== conversationId || conv.type !== "private") return conv;
      const other = conv.other_participant;
      return {
        ...conv,
        can_message: false,
        can_message_reason:
          reason ??
          "Você não pode enviar mensagens para este usuário devido às configurações de privacidade dele.",
        other_participant: other
          ? {
              ...other,
              profile_photo: null,
              can_view_profile: false,
            }
          : other,
      };
    };

    setConversations((prev) => prev.map(patch));
    setSelectedConversation((prev) => (prev ? patch(prev) : prev));
  }, []);

  const applyUnblockedByOther = useCallback(
    (
      conversationId: string,
      {
        can_message = true,
        can_message_reason = null,
        other_participant_profile_photo = null,
        can_view_profile = true,
      }: {
        can_message?: boolean;
        can_message_reason?: string | null;
        other_participant_profile_photo?: string | null;
        can_view_profile?: boolean;
      },
    ) => {
      const patch = (conv: DMConversation): DMConversation => {
        if (conv.id !== conversationId || conv.type !== "private") return conv;
        const other = conv.other_participant;
        return {
          ...conv,
          can_message,
          can_message_reason,
          other_participant: other
            ? {
                ...other,
                profile_photo:
                  other_participant_profile_photo ?? other.profile_photo,
                can_view_profile,
              }
            : other,
        };
      };

      setConversations((prev) => prev.map(patch));
      setSelectedConversation((prev) => (prev ? patch(prev) : prev));
    },
    [],
  );

  const syncConversationsFromServer = useCallback((conversationId: string) => {
    void getConversations().then((data) => {
      setConversations((prev) => {
        const byId = new Map(prev.map((c) => [c.id, c]));
        return sortConversations(
          data.map((c) => {
            const local = byId.get(c.id);
            if (!local) return c;
            return {
              ...c,
              unread_count: local.unread_count ?? c.unread_count,
            };
          }),
        );
      });
      setSelectedConversation((prev) => {
        if (!prev || prev.id !== conversationId) return prev;
        const updated = data.find((c) => c.id === prev.id);
        return updated ? { ...prev, ...updated } : prev;
      });
    });
  }, []);

  const handleConversationStatusEvent = useCallback(
    (event: {
      type?: string;
      conversation_id: string;
      status?: string;
      can_message?: boolean;
      can_message_reason?: string | null;
      other_participant_profile_photo?: string | null;
      can_view_profile?: boolean;
    }) => {
      if (!event.conversation_id) return;
      if (event.type === "user_blocked") {
        applyBlockedByOther(event.conversation_id, event.can_message_reason);
        syncConversationsFromServer(event.conversation_id);
        return;
      }
      if (event.type === "user_unblocked") {
        applyUnblockedByOther(event.conversation_id, {
          can_message: event.can_message,
          can_message_reason: event.can_message_reason,
          other_participant_profile_photo: event.other_participant_profile_photo,
          can_view_profile: event.can_view_profile,
        });
        syncConversationsFromServer(event.conversation_id);
        return;
      }
      if (event.status === "active" || event.type === "request_accepted") {
        markConversationUnlocked(event.conversation_id);
      }
    },
    [
      applyBlockedByOther,
      applyUnblockedByOther,
      syncConversationsFromServer,
      markConversationUnlocked,
    ],
  );

  const { sendEncryptedMessage, sendGroupMessage } = useDMWebSocket({
    conversationId: selectedConversation?.id ?? null,
    onNewMessage: handleNewMessage,
    onStatusEvent: handleConversationStatusEvent,
    onMessageStatus: handleMessageStatus,
  });

  useDMNotifications({
    onStatusEvent: handleConversationStatusEvent,
    onNotification: useCallback(
      (convId: string) => {
        const isOpen = convId === selectedIdRef.current;
        if (isOpen) {
          void markConversationRead(convId);
        }

        setConversations((prev) => {
          if (isOpen || !prev.some((c) => c.id === convId)) {
            return prev;
          }
          return sortConversations(
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    unread_count: (c.unread_count ?? 0) + 1,
                    updated_at: new Date().toISOString(),
                  }
                : c,
            ),
          );
        });

        void getConversations().then((data) => {
          const selectedId = selectedIdRef.current;
          setConversations((prev) => {
            const byId = new Map(prev.map((c) => [c.id, c]));
            const merged = data.map((c) => {
              const local = byId.get(c.id);
              const serverUnread = c.unread_count ?? 0;
              const localUnread = local?.unread_count ?? 0;
              const unread_count =
                c.id === selectedId ? 0 : Math.max(serverUnread, localUnread);
              return { ...c, unread_count };
            });
            return sortConversations(merged);
          });
          setSelectedConversation((prev) => {
            if (!prev) return prev;
            const updated = data.find((c) => c.id === prev.id);
            return updated ? { ...prev, ...updated, unread_count: 0 } : prev;
          });
        });
      },
      [],
    ),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Outgoing request only: if the other person already replied, local status
  // may still be pending — unlock the composer. Incoming requests always have
  // the requester's messages (!isOwn), so unlocking here would hide Accept/Reject.
  useEffect(() => {
    if (!selectedConversation || selectedConversation.status !== "pending") return;
    if (selectedConversation.is_incoming_request) return;
    const otherReplied = messages.some((m) => !m.isOwn);
    if (!otherReplied) return;
    markConversationUnlocked(selectedConversation.id);
  }, [selectedConversation, messages, markConversationUnlocked]);

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const typed = messageInput.trim();
    if (!typed || !selectedConversation || sending) return;
    if (
      selectedConversation.can_message === false ||
      selectedConversation.has_left
    )
      return;

    const text = duoReply
      ? formatDuoFinderMessage(duoReply, typed)
      : megaphoneReply
        ? `Respondendo ao alto-falante de @${megaphoneReply.authorUsername}:\n“${megaphoneReply.quote}”\n\n${typed}`
        : typed;

    if (selectedConversation.type === "group") {
      setSending(true);
      try {
        sendGroupMessage(text);
        setMessageInput("");
        setMegaphoneReply(null);
        setDuoReply(null);
      } finally {
        setSending(false);
      }
      return;
    }

    if (!isReady) return;
    if (peerKeyTrust?.status === "changed") return;
    let recipientKey = selectedConversation.other_participant?.public_key;
    if (!recipientKey && selectedConversation.other_participant?.id) {
      recipientKey = await getUserPublicKey(
        selectedConversation.other_participant.id,
      );
      if (recipientKey) {
        const resolvedKey = recipientKey;
        setSelectedConversation((prev) =>
          prev && prev.other_participant
            ? {
                ...prev,
                other_participant: {
                  ...prev.other_participant,
                  public_key: resolvedKey,
                },
              }
            : prev,
        );
      }
    }
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
      setDuoReply(null);
    } finally {
      setSending(false);
    }
  }, [
    messageInput,
    megaphoneReply,
    duoReply,
    selectedConversation,
    isReady,
    sending,
    encryptForUser,
    sendEncryptedMessage,
    sendGroupMessage,
    peerKeyTrust?.status,
  ]);

  // ── Private conversation search ───────────────────────────────────────────

  const handleSearchUsers = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `/api/users/search?search=${encodeURIComponent(q)}`,
        { credentials: "include" },
      );
      const json = await res.json();
      const data = Array.isArray(json) ? json : (json?.results ?? []);
      setSearchResults(data.slice(0, 8));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleStartConversation = useCallback(
    async (userId: string) => {
      const result = await startConversation(userId);
      if (!result.ok) {
        CustomToast.error(result.error);
        return;
      }
      setShowNewConv(false);
      setSearchQuery("");
      setSearchResults([]);
      await loadConversations();
      selectConversation(result.conversation);
    },
    [loadConversations, selectConversation],
  );

  const clearSelectedConversation = useCallback(() => {
    selectedIdRef.current = null;
    setSelectedConversation(null);
    setRawMessages([]);
    setHistoryConvId(null);
    setMessages([]);
  }, []);

  const handleAcceptMessageRequest = useCallback(async () => {
    const convId = selectedConversation?.id;
    if (!convId || acceptingRequest) return;
    setAcceptingRequest(true);
    try {
      const updated = await acceptMessageRequest(convId);
      if (!updated) return;
      markConversationUnlocked(convId);
      setSelectedConversation(updated);
      setConversations((prev) =>
        sortConversations(
          prev.map((c) => (c.id === convId ? { ...c, ...updated } : c)),
        ),
      );
      setActiveTab("private");
    } finally {
      setAcceptingRequest(false);
    }
  }, [selectedConversation?.id, acceptingRequest, markConversationUnlocked]);

  const handleExcludeMessageRequest = useCallback(async () => {
    const convId = selectedConversation?.id;
    if (!convId || excludingRequest) return;
    setExcludingRequest(true);
    try {
      const ok = await deleteConversation(convId);
      if (!ok) {
        CustomToast.error("Não foi possível excluir a solicitação.");
        return;
      }
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      clearSelectedConversation();
      setActiveTab("private");
      CustomToast.neutral("Solicitação excluída.");
    } finally {
      setExcludingRequest(false);
    }
  }, [selectedConversation?.id, excludingRequest, clearSelectedConversation]);

  const handleBlockMessageRequest = useCallback(async () => {
    const username = selectedConversation?.other_participant?.username;
    const convId = selectedConversation?.id;
    if (!username || !convId || blockingRequest) return;
    setBlockingRequest(true);
    try {
      const res = await fetch(`/api/profiles/${username}/block`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        CustomToast.error("Não foi possível bloquear este usuário.");
        return;
      }
      await deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      clearSelectedConversation();
      setActiveTab("private");
      CustomToast.success("Usuário bloqueado.");
    } catch {
      CustomToast.error("Não foi possível bloquear este usuário.");
    } finally {
      setBlockingRequest(false);
    }
  }, [selectedConversation, blockingRequest, clearSelectedConversation]);

  const handleDeleteConversation = useCallback(
    async (convId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      const ok = await deleteConversation(convId);
      if (!ok) return;
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (selectedConversation?.id === convId) clearSelectedConversation();
    },
    [selectedConversation, clearSelectedConversation],
  );

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

  const handleGroupSearchUsers = useCallback(
    async (q: string) => {
      setGroupSearchQuery(q);
      if (!q.trim()) {
        setGroupSearchResults([]);
        return;
      }
      setGroupSearching(true);
      try {
        const res = await fetch(
          `/api/users/search?search=${encodeURIComponent(q)}`,
          { credentials: "include" },
        );
        const json = await res.json();
        const data: GroupUser[] = Array.isArray(json)
          ? json
          : (json?.results ?? []);
        setGroupSearchResults(
          data
            .slice(0, 8)
            .filter((u) => !groupMembers.some((m) => m.id === u.id)),
        );
      } catch {
        setGroupSearchResults([]);
      } finally {
        setGroupSearching(false);
      }
    },
    [groupMembers],
  );

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
      const conv = await createGroup(
        groupName.trim(),
        groupMembers.map((m) => m.id),
      );
      if (!conv) return;
      handleResetGroupForm();
      const updated = await loadConversations();
      const fresh = updated.find((c) => c.id === conv.id) ?? conv;
      selectConversation(fresh);
    } finally {
      setCreatingGroup(false);
    }
  }, [
    groupName,
    groupMembers,
    creatingGroup,
    loadConversations,
    selectConversation,
    handleResetGroupForm,
  ]);

  const handleLeaveGroup = useCallback(
    async (convId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      const updated = await leaveGroup(convId);
      if (!updated) return;
      setConversations((prev) =>
        sortConversations(
          prev.map((c) =>
            c.id === convId ? { ...c, ...updated, has_left: true } : c,
          ),
        ),
      );
      setSelectedConversation((prev) =>
        prev?.id === convId ? { ...prev, ...updated, has_left: true } : prev,
      );
    },
    [],
  );

  const handleToggleMuteConversation = useCallback(
    async (convId: string) => {
      const current = conversations.find((c) => c.id === convId);
      if (!current) return;
      const nextMuted = !current.is_muted;
      const ok = await muteConversation(convId, nextMuted);
      if (!ok) return;
      setConversations((prev) =>
        sortConversations(
          prev.map((c) =>
            c.id === convId ? { ...c, is_muted: nextMuted } : c,
          ),
        ),
      );
      setSelectedConversation((prev) =>
        prev?.id === convId ? { ...prev, is_muted: nextMuted } : prev,
      );
      void refreshUnread();
      // Re-sync from server so list order + is_muted stay consistent
      void loadConversations();
    },
    [conversations, refreshUnread, loadConversations],
  );

  // ── Prepare conversation lists ────────────────────────────────────────────

  const isPrivateConv = (c: DMConversation) => c.type === "private" || !c.type;

  const requestConversations = conversations.filter(
    (c) => isPrivateConv(c) && c.is_incoming_request,
  );

  const privateConversations = conversations.filter(
    (c) =>
      isPrivateConv(c) &&
      !c.is_incoming_request &&
      (c.last_message !== null || c.status === "pending"),
  );

  const groupConversations = conversations.filter((c) => c.type === "group");

  const requestCount = requestConversations.length;

  const selectedLegacy = selectedConversation
    ? toConversationInterface(
        selectedConversation,
        getDecryptedPreview(selectedConversation, decryptedPreviews),
      )
    : null;

  const isSendDisabled =
    sending ||
    Boolean(selectedConversation?.has_left) ||
    selectedConversation?.can_message === false ||
    (selectedConversation?.type !== "group" && !isReady) ||
    peerKeyTrust?.status === "changed";

  const messagingRestricted =
    selectedConversation?.type === "private" &&
    selectedConversation.can_message === false;

  const messagingRestrictedReason =
    selectedConversation?.can_message_reason ??
    "Você não pode enviar mensagens para este usuário devido às configurações de privacidade dele.";

  const showIncomingRequest =
    selectedConversation?.type === "private" &&
    selectedConversation.is_incoming_request;

  const keyChangedBlocked = peerKeyTrust?.status === "changed";

  const e2eBlocked =
    selectedConversation?.type === "private" &&
    !selectedConversation.has_left &&
    selectedConversation.can_message !== false &&
    !isReady;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div
        className={cn(
          "flex w-full flex-col border-border/50 md:w-1/3 md:border-r",
          selectedConversation ? "hidden md:flex" : "flex",
        )}
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex h-full flex-col"
        >
          <div className="pt-3 sm:pt-4">
            {activeTab === "requests" ? (
              <div className="mb-2 flex items-center gap-1 px-2 sm:px-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("private")}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  aria-label="Voltar para conversas"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-foreground">
                    Solicitações
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Aceite para conversar · {requestCount}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-2 flex items-center gap-2 px-3 sm:px-4">
                  <div className="min-w-0 flex-1">
                    <ChatTabs />
                  </div>
                  <button
                    onClick={() => {
                      setShowNewConv((v) => !v);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors hover:bg-primary/20"
                    title="Nova conversa"
                  >
                    {showNewConv ? (
                      <XIcon className="h-4 w-4 text-primary" />
                    ) : (
                      <Plus className="h-4 w-4 text-primary" />
                    )}
                  </button>
                </div>
                {requestCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("requests")}
                    className="mx-3 mb-2 flex w-[calc(100%-1.5rem)] items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted/60 sm:mx-4 sm:w-[calc(100%-2rem)]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Inbox className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        Solicitações de mensagem
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {requestCount === 1
                          ? "1 pessoa quer conversar"
                          : `${requestCount} pessoas querem conversar`}
                      </span>
                    </span>
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                      {requestCount > 9 ? "9+" : requestCount}
                    </span>
                  </button>
                ) : null}
              </>
            )}
            {showNewConv && activeTab !== "requests" && (
              <div className="space-y-1 px-3 pb-2 sm:px-4">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  placeholder="Buscar por username..."
                  className="w-full rounded-lg border border-border/50 bg-muted/50 px-3 py-2 text-sm outline-none focus:border-primary/50"
                />
                {searching && (
                  <p className="px-1 text-xs text-muted-foreground">
                    Buscando...
                  </p>
                )}
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartConversation(u.id)}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60"
                  >
                    <span className="font-medium">
                      {u.first_name} {u.last_name}
                    </span>
                    <span className="ml-1 text-muted-foreground">
                      @{u.username}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Private conversations */}
          <TabsContent
            value="private"
            className="mt-0 p-0 flex-1 overflow-hidden"
          >
            <ScrollArea style={{ height: listHeight }}>
              {privateConversations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma conversa ainda.
                </p>
              ) : (
                privateConversations.map((conv) => (
                  <PrivateConversationRow
                    key={conv.id}
                    conv={conv}
                    decryptedPreviews={decryptedPreviews}
                    selectedId={selectedConversation?.id}
                    onSelect={selectConversation}
                    onDelete={handleDeleteConversation}
                  />
                ))
              )}
            </ScrollArea>
          </TabsContent>

          {/* Message requests */}
          <TabsContent
            value="requests"
            className="mt-0 p-0 flex-1 overflow-hidden"
          >
            <ScrollArea style={{ height: listHeight }}>
              {requestConversations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 px-4">
                  Nenhuma solicitação de mensagem.
                </p>
              ) : (
                requestConversations.map((conv) => (
                  <PrivateConversationRow
                    key={conv.id}
                    conv={conv}
                    decryptedPreviews={decryptedPreviews}
                    selectedId={selectedConversation?.id}
                    onSelect={selectConversation}
                    onDelete={handleDeleteConversation}
                    subtitle={
                      conv.last_message
                        ? undefined
                        : "Quer enviar uma mensagem para você"
                    }
                  />
                ))
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
                  {groupSearching && (
                    <p className="text-xs text-muted-foreground px-1">
                      Buscando...
                    </p>
                  )}
                  {groupSearchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleAddGroupMember(u)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/60 text-sm transition-colors"
                    >
                      <span className="font-medium">
                        {u.first_name} {u.last_name}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        @{u.username}
                      </span>
                    </button>
                  ))}
                  {groupMembers.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Membros selecionados
                      </p>
                      {groupMembers.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 text-sm"
                        >
                          <span>
                            {m.first_name} {m.last_name}
                            <span className="text-muted-foreground ml-1">
                              @{m.username}
                            </span>
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
                    disabled={
                      !groupName.trim() ||
                      groupMembers.length === 0 ||
                      creatingGroup
                    }
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
                      <p className="text-sm text-muted-foreground text-center">
                        Nenhum grupo ainda.
                      </p>
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
                                      onClick={(e) =>
                                        handleLeaveGroup(conv.id, e)
                                      }
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
          selectedConversation ? "flex" : "hidden md:flex",
        )}
      >
        {selectedConversation ? (
          <>
            <ChatHeader
              selectedConversation={selectedLegacy}
              onBack={clearSelectedConversation}
              onLeaveGroup={
                selectedConversation.type === "group" &&
                !selectedConversation.has_left
                  ? () => handleLeaveGroup(selectedConversation.id)
                  : undefined
              }
              onToggleMuteConversation={() =>
                handleToggleMuteConversation(selectedConversation.id)
              }
              onDeleteConversation={() =>
                handleDeleteConversation(selectedConversation.id)
              }
              onBlockUser={
                selectedConversation.type === "private"
                  ? () => handleBlockUser()
                  : undefined
              }
              keyTrustStatus={
                selectedConversation.type === "private"
                  ? peerKeyTrust?.status ?? null
                  : null
              }
              onConfirmKeyTrust={
                keyChangedBlocked ? handleConfirmPeerKeyTrust : undefined
              }
            />
            {keyChangedBlocked ? (
              <div className="flex items-start gap-2 border-b border-amber-500/30 bg-amber-500/10 px-3 py-2.5 sm:px-4">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground sm:text-sm">
                    A chave de criptografia mudou
                  </p>
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    Confirme o código de segurança antes de enviar novas mensagens.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSafetyDialogOpen(true)}
                      className="rounded-md border border-border/60 px-2.5 py-1 text-xs transition-colors hover:bg-muted/60"
                    >
                      Ver código
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmPeerKeyTrust}
                      className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Confiar nesta chave
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            <ScrollArea className={chatHeight + " p-3 pt-2 sm:p-4 sm:pt-2"}>
              {loadingMessages ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Carregando...
                </p>
              ) : (
                <ChatMessages messages={messages} />
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
            {selectedConversation.has_left ? (
              <div className="border-t border-border/50 bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
                Você saiu deste grupo. Ainda pode ver as mensagens antigas.
              </div>
            ) : showIncomingRequest ? (
              <div className="border-t border-border/50 bg-muted/40 px-4 py-3">
                <p className="text-center text-sm text-muted-foreground mb-3">
                  Este usuário quer enviar uma mensagem para você.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => void handleAcceptMessageRequest()}
                    disabled={
                      acceptingRequest || excludingRequest || blockingRequest
                    }
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
                  >
                    {acceptingRequest ? "Aceitando..." : "Aceitar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleExcludeMessageRequest()}
                    disabled={
                      acceptingRequest || excludingRequest || blockingRequest
                    }
                    className="px-4 py-2 rounded-lg border border-border/50 text-sm text-muted-foreground hover:bg-muted/60 transition-colors disabled:opacity-50"
                  >
                    {excludingRequest ? "Excluindo..." : "Excluir"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleBlockMessageRequest()}
                    disabled={
                      acceptingRequest || excludingRequest || blockingRequest
                    }
                    className="px-4 py-2 rounded-lg border border-destructive/40 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  >
                    {blockingRequest ? "Bloqueando..." : "Bloquear"}
                  </button>
                </div>
              </div>
            ) : messagingRestricted ? (
              <div className="border-t border-border/50 bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
                {messagingRestrictedReason}
              </div>
            ) : e2eBlocked ? (
              <div className="border-t border-border/50 bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
                {needsUnlock
                  ? "Criptografia indisponível neste dispositivo. Entre na sua conta novamente — as mensagens voltam a abrir sozinhas."
                  : "Abrindo mensagens criptografadas..."}
              </div>
            ) : (
              <>
                <InputMessage
                  ref={inputRef}
                  onInput={setMessageInput}
                  messageInput={messageInput}
                  onSend={handleSend}
                  disabled={isSendDisabled}
                  megaphoneReply={megaphoneReply}
                  onDismissMegaphoneReply={() => setMegaphoneReply(null)}
                  duoReply={duoReply}
                  onDismissDuoReply={() => setDuoReply(null)}
                />
              </>
            )}
            <KeySafetyDialog
              open={safetyDialogOpen}
              onOpenChange={setSafetyDialogOpen}
              peerName={selectedLegacy?.name ?? "Contato"}
              peerUsername={selectedLegacy?.username}
              fingerprint={peerKeyTrust?.fingerprint ?? null}
              changed={keyChangedBlocked}
              onConfirmTrust={
                keyChangedBlocked ? handleConfirmPeerKeyTrust : undefined
              }
            />
          </>
        ) : (
          <NoConversationSelected />
        )}
      </div>
    </div>
  );
}
