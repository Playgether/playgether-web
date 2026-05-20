"use client";

import { ChatRoomMessages } from "@/types/ChatRoomMessages";
import type { RoomEventInvitePayload } from "@/types/RoomEvents";
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
  MutableRefObject,
} from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useAuthContext } from "./AuthContext";
import { OnlineUsersChatRoom } from "@/types/OnlineUsersChatRoom";
import type { RoomMusicClientAction, RoomMusicState } from "@/types/RoomMusic";
import type {
  RoomAmbienceClientAction,
  RoomAmbienceMessage,
  RoomAmbienceState,
} from "@/types/RoomAmbience";
import { fetchAmbienceChatHistory } from "@/actions/ambienceChatActions";

function mergeAmbienceMessages(
  older: RoomAmbienceMessage[],
  newer: RoomAmbienceMessage[],
): RoomAmbienceMessage[] {
  const byId = new Map<number, RoomAmbienceMessage>();
  for (const m of older) byId.set(m.id, m);
  for (const m of newer) byId.set(m.id, m);
  return [...byId.values()]
    .sort((a, b) => a.created_at_ms - b.created_at_ms)
    .slice(-200);
}

export type RoomJoinNotice = { id: number; text: string };

const defaultRoomMusicState = (): RoomMusicState => ({
  queue: [],
  current_index: -1,
  playing: false,
  volume: 80,
  position_sec: 0,
  sync_epoch_ms: 0,
});

const defaultRoomAmbienceState = (): RoomAmbienceState => ({
  active: false,
  host_user_id: null,
  host_username: "",
  host_profile_photo: "",
  video_id: "",
  title: "",
  channel_name: "",
  channel_url: "",
  channel_thumbnail: "",
  channel_avatar_url: "",
  playing: false,
  position_sec: 0,
  sync_epoch_ms: 0,
  viewers: [],
  pinned_message_id: null,
});

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Scroll vertical suave (evita o “snap” agressivo do `behavior: smooth` do browser). */
function animateScrollTop(
  el: HTMLElement,
  to: number,
  durationMs: number,
  onComplete?: () => void,
): () => void {
  const start = el.scrollTop;
  const change = to - start;
  if (Math.abs(change) < 1) {
    onComplete?.();
    return () => {};
  }
  const t0 = performance.now();
  let raf = 0;

  const step = (now: number) => {
    const elapsed = now - t0;
    const t = Math.min(1, elapsed / durationMs);
    el.scrollTop = start + change * easeOutCubic(t);
    if (t < 1) {
      raf = requestAnimationFrame(step);
    } else {
      onComplete?.();
    }
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

type ChatHandlerContextProps = {
  newMessage: string;
  setNewMessage: (message: string) => void;
  realTimeMessages: ChatRoomMessages[];
  handleRealTimeMessages: (messages: ChatRoomMessages[]) => void;
  sendMessage: () => void;
  messagesDiv: MutableRefObject<HTMLDivElement | null>;
  messagesQuantity: number;
  resetMessagesQuantity: () => void;
  shouldScrollToBottom: boolean;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  executeScrollBottom: () => void;
  executeScrollToFirstNewMessage: () => void;
  newMessageId: number;
  prependOlderMessages: (older: ChatRoomMessages[]) => void;
  notifyHistoryPrependComplete: () => void;
  onlineUsers: OnlineUsersChatRoom[];
  joinNotices: RoomJoinNotice[];
  dismissJoinNotice: (id: number) => void;
  roomEventInvite: RoomEventInvitePayload | null;
  clearRoomEventInvite: () => void;
  /** Quando o chat não está visível (outra aba ou tela cheia do evento), novas mensagens contam como não lidas. */
  setChatSurfaceHidden: (hidden: boolean) => void;
  roomMusic: RoomMusicState;
  sendRoomMusic: (payload: RoomMusicClientAction) => void;
  roomMusicError: string | null;
  clearRoomMusicError: () => void;
  roomAmbience: RoomAmbienceState;
  roomAmbienceMessages: RoomAmbienceMessage[];
  sendRoomAmbience: (payload: RoomAmbienceClientAction) => void;
  roomAmbienceError: string | null;
  clearRoomAmbienceError: () => void;
};

const ChatHandlerContext = createContext<ChatHandlerContextProps>(
  {} as ChatHandlerContextProps,
);

const ChatHandlerContextProvider = ({
  token,
  chatroom,
  children,
}: {
  token: string;
  chatroom: string;
  children: React.ReactNode;
}) => {
  const encodedChatroom = encodeURIComponent(chatroom);
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    `ws://192.168.18.8:8000/ws/chatroom/${encodedChatroom}?token=${token}`,
    {
      share: false,
      shouldReconnect: () => false,
    },
  );

  const [messagesQuantity, setMessagesQuanity] = useState(0);
  const [newMessage, setNewMessage] = useState("");
  const [realTimeMessages, setRealTimeMessages] = useState<ChatRoomMessages[]>(
    [],
  );
  const messagesDiv = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);
  /** Ignora `handleScroll` enquanto animamos (evita estado inconsistente no meio do movimento). */
  const isAnimatingScrollRef = useRef(false);
  const cancelScrollAnimRef = useRef<(() => void) | null>(null);
  /** Evita animação/scroll automático ao colar mensagens antigas no topo (infinite scroll). */
  const suppressAutoFollowScrollRef = useRef(false);
  const { user } = useAuthContext();
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [newMessageId, setNewMessageId] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUsersChatRoom[]>([]);
  const [joinNotices, setJoinNotices] = useState<RoomJoinNotice[]>([]);
  const [roomEventInvite, setRoomEventInvite] =
    useState<RoomEventInvitePayload | null>(null);
  const [roomMusic, setRoomMusic] = useState<RoomMusicState>(defaultRoomMusicState);
  const [roomMusicError, setRoomMusicError] = useState<string | null>(null);
  const [roomAmbience, setRoomAmbience] = useState<RoomAmbienceState>(
    defaultRoomAmbienceState,
  );
  const [roomAmbienceMessages, setRoomAmbienceMessages] = useState<
    RoomAmbienceMessage[]
  >([]);
  const [roomAmbienceError, setRoomAmbienceError] = useState<string | null>(null);
  const chatSurfaceHiddenRef = useRef(false);
  const ambienceHistoryLoadedRef = useRef(false);

  useEffect(() => {
    if (!roomAmbience.active) {
      ambienceHistoryLoadedRef.current = false;
      return;
    }
    if (ambienceHistoryLoadedRef.current) return;
    ambienceHistoryLoadedRef.current = true;
    let cancelled = false;
    void fetchAmbienceChatHistory(chatroom).then((res) => {
      if (cancelled || !res.ok) return;
      setRoomAmbienceMessages((prev) => mergeAmbienceMessages(res.data, prev));
    });
    return () => {
      cancelled = true;
    };
  }, [roomAmbience.active, chatroom]);

  const setChatSurfaceHidden = useCallback((hidden: boolean) => {
    chatSurfaceHiddenRef.current = hidden;
  }, []);

  const dismissJoinNotice = (id: number) => {
    setJoinNotices((prev) => prev.filter((n) => n.id !== id));
  };

  const clearRoomEventInvite = () => setRoomEventInvite(null);

  const clearRoomMusicError = useCallback(() => setRoomMusicError(null), []);
  const clearRoomAmbienceError = useCallback(() => setRoomAmbienceError(null), []);

  const sendRoomMusic = useCallback(
    (payload: RoomMusicClientAction) => {
      if (readyState !== ReadyState.OPEN) return;
      sendJsonMessage({ type: "room_music", ...payload });
    },
    [readyState, sendJsonMessage],
  );

  const sendRoomAmbience = useCallback(
    (payload: RoomAmbienceClientAction) => {
      if (readyState !== ReadyState.OPEN) return;
      sendJsonMessage({ type: "room_ambience", ...payload });
    },
    [readyState, sendJsonMessage],
  );

  useEffect(() => {
    shouldScrollRef.current = shouldScrollToBottom;
  }, [shouldScrollToBottom]);

  useEffect(() => {
    return () => {
      cancelScrollAnimRef.current?.();
    };
  }, []);

  const eventHandlers = {
    online_users: (data) => {
      setOnlineUsers(data.users);
    },
    message_handler: (data) => {
      const message = data.message as ChatRoomMessages;
      setRealTimeMessages((prevMessages) => [...prevMessages, message]);
      if (message.author_username !== user?.username) {
        if (chatSurfaceHiddenRef.current) {
          setMessagesQuanity((prev) => {
            const next = prev + 1;
            if (prev === 0) {
              setNewMessageId(message.id);
            }
            return next;
          });
          return;
        }
        if (shouldScrollRef.current) {
          setShouldScrollToBottom(false);
          setTimeout(() => setShouldScrollToBottom(true), 0);
        } else {
          setMessagesQuanity((prev) => {
            const next = prev + 1;
            if (prev === 0) {
              setNewMessageId(message.id);
            }
            return next;
          });
        }
      } else {
        setShouldScrollToBottom(false);
        setTimeout(() => setShouldScrollToBottom(true), 0);
      }
    },
    user_joined: (data: { user: { fullname: string; username: string } }) => {
      if (data.user.username === user?.username) return;
      const id = Date.now() + Math.floor(Math.random() * 1000);
      const text = `${data.user.fullname} entrou na sala`;
      setJoinNotices((prev) => [...prev.slice(-4), { id, text }]);
    },
    room_event_invite: (data: { payload: RoomEventInvitePayload }) => {
      setRoomEventInvite(data.payload);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("playgether:room-event-sync"));
      }
    },
    room_music_state: (data: { state?: RoomMusicState }) => {
      const s = data.state;
      if (!s || typeof s !== "object") return;
      const next = defaultRoomMusicState();
      const rawQ = Array.isArray(s.queue) ? s.queue : [];
      next.queue = rawQ
        .filter((x) => Boolean(x) && typeof x === "object")
        .map((x) => {
          const o = x as Record<string, unknown>;
          const video_id = typeof o.video_id === "string" ? o.video_id : "";
          const title = typeof o.title === "string" ? o.title : "YouTube";
          const added_by =
            typeof o.added_by === "string" ? o.added_by : undefined;
          return { video_id, title, added_by };
        })
        .filter((x) => /^[a-zA-Z0-9_-]{11}$/.test(x.video_id));
      next.current_index =
        typeof s.current_index === "number" ? s.current_index : -1;
      next.playing = Boolean(s.playing);
      if (next.queue.length === 0) {
        next.current_index = -1;
        next.playing = false;
        next.position_sec = 0;
      } else if (next.current_index >= next.queue.length) {
        next.current_index = next.queue.length - 1;
      }
      next.volume =
        typeof s.volume === "number"
          ? Math.max(0, Math.min(100, s.volume))
          : 80;
      next.position_sec =
        typeof s.position_sec === "number" ? Math.max(0, s.position_sec) : 0;
      next.sync_epoch_ms =
        typeof s.sync_epoch_ms === "number" ? s.sync_epoch_ms : 0;
      setRoomMusic(next);
    },
    room_music_error: (data: { message?: string }) => {
      setRoomMusicError(
        typeof data.message === "string" ? data.message : "Erro na música da sala.",
      );
    },
    room_ambience_state: (data: {
      state?: RoomAmbienceState;
      messages?: RoomAmbienceMessage[];
    }) => {
      const s = data.state;
      if (s && typeof s === "object") {
        const next = defaultRoomAmbienceState();
        next.active = Boolean(s.active);
        next.host_user_id =
          typeof s.host_user_id === "number" ? s.host_user_id : null;
        next.host_username =
          typeof s.host_username === "string" ? s.host_username : "";
        next.host_profile_photo =
          typeof s.host_profile_photo === "string" ? s.host_profile_photo : "";
        next.video_id = typeof s.video_id === "string" ? s.video_id : "";
        next.title = typeof s.title === "string" ? s.title : "";
        next.channel_name =
          typeof s.channel_name === "string" ? s.channel_name : "";
        next.channel_url =
          typeof s.channel_url === "string" ? s.channel_url : "";
        next.channel_thumbnail =
          typeof s.channel_thumbnail === "string" ? s.channel_thumbnail : "";
        next.channel_avatar_url =
          typeof s.channel_avatar_url === "string" ? s.channel_avatar_url : "";
        next.playing = Boolean(s.playing);
        next.position_sec =
          typeof s.position_sec === "number" ? Math.max(0, s.position_sec) : 0;
        next.sync_epoch_ms =
          typeof s.sync_epoch_ms === "number" ? s.sync_epoch_ms : 0;
        next.viewers = Array.isArray(s.viewers)
          ? s.viewers
              .filter((x) => Boolean(x) && typeof x === "object")
              .map((x) => {
                const o = x as Record<string, unknown>;
                return {
                  user_id: typeof o.user_id === "number" ? o.user_id : 0,
                  username: typeof o.username === "string" ? o.username : "",
                  fullname: typeof o.fullname === "string" ? o.fullname : "",
                  profile_photo: typeof o.profile_photo === "string" ? o.profile_photo : "",
                };
              })
              .filter((x) => x.user_id > 0)
          : [];
        const rawPin = (s as { pinned_message_id?: unknown }).pinned_message_id;
        next.pinned_message_id =
          typeof rawPin === "number" && rawPin > 0 ? rawPin : null;
        setRoomAmbience(next);
        if (!next.active) {
          setRoomAmbienceMessages([]);
        }
      }
      if (Array.isArray(data.messages)) {
        const parsed = data.messages
          .filter((x) => Boolean(x) && typeof x === "object")
          .map((x) => {
            const m = x as Record<string, unknown>;
            const author_user_id =
              typeof m.author_user_id === "number" ? m.author_user_id : 0;
            const replyToId =
              typeof m.reply_to_id === "number" && m.reply_to_id > 0
                ? m.reply_to_id
                : undefined;
            return {
              id: typeof m.id === "number" ? m.id : 0,
              author_user_id,
              author_username:
                typeof m.author_username === "string" ? m.author_username : "",
              author_photo:
                typeof m.author_photo === "string" ? m.author_photo : undefined,
              body: typeof m.body === "string" ? m.body : "",
              created_at_ms:
                typeof m.created_at_ms === "number" ? m.created_at_ms : 0,
              is_system: author_user_id === 0,
              reply_to_id: replyToId,
              reply_to_username:
                typeof m.reply_to_username === "string"
                  ? m.reply_to_username
                  : undefined,
              reply_to_body:
                typeof m.reply_to_body === "string" ? m.reply_to_body : undefined,
            } satisfies RoomAmbienceMessage;
          })
          .filter((m) => m.id > 0 && m.body);
        setRoomAmbienceMessages((prev) => mergeAmbienceMessages(parsed, prev));
      }
    },
    room_ambience_chat_message: (data: { message?: RoomAmbienceMessage }) => {
      const m = data.message;
      if (!m || typeof m !== "object") return;
      const normalized: RoomAmbienceMessage = {
        ...m,
        is_system:
          m.is_system ??
          (typeof m.author_user_id === "number" && m.author_user_id === 0),
        reply_to_id:
          typeof m.reply_to_id === "number" && m.reply_to_id > 0
            ? m.reply_to_id
            : undefined,
        reply_to_username:
          typeof m.reply_to_username === "string" ? m.reply_to_username : undefined,
        reply_to_body:
          typeof m.reply_to_body === "string" ? m.reply_to_body : undefined,
      };
      setRoomAmbienceMessages((prev) => {
        if (prev.some((x) => x.id === normalized.id)) return prev;
        return [...prev, normalized].slice(-200);
      });
    },
    room_ambience_error: (data: { message?: string }) => {
      setRoomAmbienceError(
        typeof data.message === "string"
          ? data.message
          : "Erro no modo ambiente.",
      );
    },
    room_ambience_anchor_request: () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("playgether:ambience-anchor-request"));
      }
    },
    room_event_sync: (data: {
      payload?: {
        reason?: string;
        message?: string;
        organizer_user_id?: number;
      };
    }) => {
      const reason = data?.payload?.reason;
      const message = data?.payload?.message;
      const organizer_user_id = data?.payload?.organizer_user_id;
      if (
        reason &&
        [
          "event_begun",
          "event_begun_early",
          "event_cancelled",
          "event_cancelled_by_host",
          "event_finished",
        ].includes(reason)
      ) {
        setRoomEventInvite(null);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("playgether:room-event-sync", {
            detail: { reason, message, organizer_user_id },
          }),
        );
      }
    },
  };

  const handleRealTimeMessages = (messages: ChatRoomMessages[]) => {
    setRealTimeMessages(messages);
  };

  const prependOlderMessages = (older: ChatRoomMessages[]) => {
    suppressAutoFollowScrollRef.current = true;
    setRealTimeMessages((prev) => {
      const have = new Set(prev.map((m) => m.id));
      const merged = older.filter((m) => !have.has(m.id));
      return [...merged, ...prev];
    });
  };

  const notifyHistoryPrependComplete = () => {
    suppressAutoFollowScrollRef.current = false;
  };

  const resetMessagesQuantity = () => {
    setMessagesQuanity(0);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isAnimatingScrollRef.current) return;
    const t = e.currentTarget;
    const gap = t.scrollHeight - t.scrollTop - t.clientHeight;
    const nearBottom = gap <= 16;
    if (nearBottom) {
      setShouldScrollToBottom(true);
      resetMessagesQuantity();
      setNewMessageId(0);
    } else {
      setShouldScrollToBottom(false);
    }
  };

  const runSmoothScrollToBottom = (durationMs: number, onDone?: () => void) => {
    const el = messagesDiv.current;
    if (!el) {
      onDone?.();
      return;
    }
    cancelScrollAnimRef.current?.();
    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
    isAnimatingScrollRef.current = true;
    cancelScrollAnimRef.current = animateScrollTop(
      el,
      maxScroll,
      durationMs,
      () => {
        isAnimatingScrollRef.current = false;
        cancelScrollAnimRef.current = null;
        setShouldScrollToBottom(true);
        resetMessagesQuantity();
        setNewMessageId(0);
        onDone?.();
      },
    );
  };

  const executeScrollBottom = () => {
    runSmoothScrollToBottom(820);
  };

  const executeScrollToFirstNewMessage = () => {
    const anchorId = newMessageId;
    const container = messagesDiv.current;
    const target = anchorId
      ? document.getElementById(`new-msg-${anchorId}`)
      : null;
    if (!anchorId || !container || !target) {
      return;
    }

    cancelScrollAnimRef.current?.();

    const cRect = container.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const scrollDelta =
      tRect.top + tRect.height / 2 - (cRect.top + cRect.height / 2);
    const maxScroll = Math.max(
      0,
      container.scrollHeight - container.clientHeight,
    );
    const nextTop = Math.max(
      0,
      Math.min(container.scrollTop + scrollDelta, maxScroll),
    );

    isAnimatingScrollRef.current = true;
    cancelScrollAnimRef.current = animateScrollTop(
      container,
      nextTop,
      780,
      () => {
        isAnimatingScrollRef.current = false;
        cancelScrollAnimRef.current = null;
        setMessagesQuanity(0);
      },
    );
  };

  useEffect(() => {
    if (lastJsonMessage && typeof lastJsonMessage === "object") {
      const eventType = (lastJsonMessage as { type: string }).type;
      if (eventType && eventHandlers[eventType]) {
        (eventHandlers as Record<string, (msg: unknown) => void>)[eventType](
          lastJsonMessage,
        );
      }
    }
  }, [lastJsonMessage, user?.username]);

  useEffect(() => {
    if (suppressAutoFollowScrollRef.current) return;
    if (!shouldScrollToBottom) return;
    const el = messagesDiv.current;
    if (!el) return;
    cancelScrollAnimRef.current?.();
    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
    if (Math.abs(el.scrollTop - maxScroll) < 4) return;
    /** Seguir novas mensagens sem animação — não interfere no scroll manual com a roda. */
    el.scrollTop = maxScroll;
  }, [realTimeMessages.length, shouldScrollToBottom]);

  // Função para enviar mensagem
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    sendJsonMessage({
      event: "message_handler",
      body: newMessage,
    });
    setNewMessage("");
  };

  return (
    <ChatHandlerContext.Provider
      value={{
        newMessage,
        setNewMessage,
        realTimeMessages,
        handleRealTimeMessages,
        sendMessage,
        messagesDiv,
        messagesQuantity,
        resetMessagesQuantity,
        shouldScrollToBottom,
        handleScroll,
        executeScrollBottom,
        executeScrollToFirstNewMessage,
        newMessageId,
        prependOlderMessages,
        notifyHistoryPrependComplete,
        onlineUsers,
        joinNotices,
        dismissJoinNotice,
        roomEventInvite,
        clearRoomEventInvite,
        setChatSurfaceHidden,
        roomMusic,
        sendRoomMusic,
        roomMusicError,
        clearRoomMusicError,
        roomAmbience,
        roomAmbienceMessages,
        sendRoomAmbience,
        roomAmbienceError,
        clearRoomAmbienceError,
      }}
    >
      {children}
    </ChatHandlerContext.Provider>
  );
};

const useChatHandlerContext = () => {
  const context = useContext(ChatHandlerContext);
  return context;
};

export {
  ChatHandlerContextProvider,
  useChatHandlerContext,
  ChatHandlerContext,
};
