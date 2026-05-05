"use client";

import { ChatRoomMessages } from "@/types/ChatRoomMessages";
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  MutableRefObject,
} from "react";
import useWebSocket from "react-use-websocket";
import { useAuthContext } from "./AuthContext";
import { OnlineUsersChatRoom } from "@/types/OnlineUsersChatRoom";

export type RoomJoinNotice = { id: number; text: string };

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Scroll vertical suave (evita o “snap” agressivo do `behavior: smooth` do browser). */
function animateScrollTop(
  el: HTMLElement,
  to: number,
  durationMs: number,
  onComplete?: () => void
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
};

const ChatHandlerContext = createContext<ChatHandlerContextProps>(
  {} as ChatHandlerContextProps
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
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    `ws://192.168.18.8:8000/ws/chatroom/${chatroom}?token=${token}`,
    {
      share: false,
      shouldReconnect: () => false,
    }
  );

  const [messagesQuantity, setMessagesQuanity] = useState(0);
  const [newMessage, setNewMessage] = useState("");
  const [realTimeMessages, setRealTimeMessages] = useState<ChatRoomMessages[]>(
    []
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

  const dismissJoinNotice = (id: number) => {
    setJoinNotices((prev) => prev.filter((n) => n.id !== id));
  };

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

  const runSmoothScrollToBottom = (
    durationMs: number,
    onDone?: () => void
  ) => {
    const el = messagesDiv.current;
    if (!el) {
      onDone?.();
      return;
    }
    cancelScrollAnimRef.current?.();
    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
    isAnimatingScrollRef.current = true;
    cancelScrollAnimRef.current = animateScrollTop(el, maxScroll, durationMs, () => {
      isAnimatingScrollRef.current = false;
      cancelScrollAnimRef.current = null;
      setShouldScrollToBottom(true);
      resetMessagesQuantity();
      setNewMessageId(0);
      onDone?.();
    });
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
    const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
    const nextTop = Math.max(
      0,
      Math.min(container.scrollTop + scrollDelta, maxScroll)
    );

    isAnimatingScrollRef.current = true;
    cancelScrollAnimRef.current = animateScrollTop(container, nextTop, 780, () => {
      isAnimatingScrollRef.current = false;
      cancelScrollAnimRef.current = null;
      setMessagesQuanity(0);
    });
  };

  useEffect(() => {
    if (lastJsonMessage && typeof lastJsonMessage === "object") {
      const eventType = (lastJsonMessage as { type: string }).type;
      if (eventType && eventHandlers[eventType]) {
        (eventHandlers as Record<string, (msg: unknown) => void>)[eventType](
          lastJsonMessage
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
