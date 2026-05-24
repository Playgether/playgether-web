"use client";

import { loadMoreChatRoomMessages } from "@/actions/loadMoreChatRoomMessages";
import { getAmbientPeriodForNow } from "@/app/utils/roomAmbientPeriod";
import {
  parseAmbientMediaValue,
  resolveAmbientAbsoluteUrl,
} from "@/app/utils/roomAmbientMedia";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import ProfileImagePost from "@/components/pages/feed/DesktopFeed/Middle/PostsComponents/ProfileImagePost/ProfileImagePost";
import { useAuthContext } from "@/context/AuthContext";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { extractRoomFromDetailedBody } from "@/services/chatRoomApi";
import { ChatRoom } from "@/types/ChatRoom";
import { ChatRoomMessages } from "@/types/ChatRoomMessages";
import { ArrowDown, Loader2, MessageSquare } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import RoomChatInput from "./RoomChatInput";
import type { RoomJoinNotice } from "@/context/ChatHandlerContext";

function JoinNoticeChip({
  notice,
  onDismiss,
}: {
  notice: RoomJoinNotice;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const t = window.setTimeout(() => onDismiss(notice.id), 5200);
    return () => window.clearTimeout(t);
  }, [notice.id, onDismiss]);

  return (
    <div className="flex justify-center py-1">
      <span className="inline-block max-w-[95%] rounded-full bg-muted/70 px-3 py-0.5 text-center text-[11px] leading-snug text-muted-foreground shadow-sm backdrop-blur-[2px]">
        {notice.text}
      </span>
    </div>
  );
}

interface RoomChatMessagesPanelProps {
  messages: ChatRoomMessages[];
  room: ChatRoom;
  initialMessagesNextPageUrl?: string | null;
}

export default function RoomChatMessagesPanel({
  messages,
  room,
  initialMessagesNextPageUrl = null,
}: RoomChatMessagesPanelProps) {
  const [isLoading, setIsLoading] = useState(true);
  const {
    realTimeMessages,
    handleRealTimeMessages,
    messagesDiv,
    messagesQuantity,
    handleScroll,
    shouldScrollToBottom,
    executeScrollBottom,
    executeScrollToFirstNewMessage,
    newMessageId,
    prependOlderMessages,
    notifyHistoryPrependComplete,
    onlineUsers,
    joinNotices,
    dismissJoinNotice,
  } = useChatHandlerContext();
  const { user } = useAuthContext();

  const [timeTick, setTimeTick] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(
    initialMessagesNextPageUrl,
  );
  const [loadingOlder, setLoadingOlder] = useState(false);
  const loadingOlderRef = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => setTimeTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const ambientBackground = useMemo(() => {
    const period = getAmbientPeriodForNow();
    const raw = room.ambient_images?.[period];
    const parsed = parseAmbientMediaValue(raw ? String(raw) : "");
    if (!parsed) return null;
    return { parsed, url: resolveAmbientAbsoluteUrl(parsed) };
  }, [room.ambient_images, timeTick]);

  const visibleOnlineCount = onlineUsers.length;

  useEffect(() => {
    if (messages && messages.length > 0 && realTimeMessages.length === 0) {
      handleRealTimeMessages([...messages].reverse());
    }

    setIsLoading(false);
  }, [messages, realTimeMessages.length]);

  const fetchOlderMessages = useCallback(async () => {
    if (!nextPageUrl || loadingOlderRef.current) return;
    const container = messagesDiv.current;
    if (!container) return;

    loadingOlderRef.current = true;
    setLoadingOlder(true);
    const prevScrollHeight = container.scrollHeight;
    const prevScrollTop = container.scrollTop;

    const res = await loadMoreChatRoomMessages(nextPageUrl);
    if (!res.ok || !res.data) {
      loadingOlderRef.current = false;
      setLoadingOlder(false);
      return;
    }

    const extracted = extractRoomFromDetailedBody(res.data);
    const batch = extracted.messages;
    const next = extracted.messagesNextPageUrl;
    const reversed = [...batch].reverse();

    prependOlderMessages(reversed);
    setNextPageUrl(next);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = messagesDiv.current;
        if (el) {
          const delta = el.scrollHeight - prevScrollHeight;
          el.scrollTop = prevScrollTop + delta;
        }
        notifyHistoryPrependComplete();
        loadingOlderRef.current = false;
        setLoadingOlder(false);
      });
    });
  }, [nextPageUrl, prependOlderMessages, notifyHistoryPrependComplete]);

  const handleMessagesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    handleScroll(e);
    const el = e.currentTarget;
    if (el.scrollTop < 140 && nextPageUrl && !loadingOlderRef.current) {
      void fetchOlderMessages();
    }
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {ambientBackground ? (
        <>
          {ambientBackground.parsed.kind === "video" ? (
            <video
              key={ambientBackground.url}
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
              src={ambientBackground.url}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
            />
          ) : (
            <div
              className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${ambientBackground.url})` }}
              aria-hidden
            />
          )}
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-background/70 via-background/50 to-background/70 backdrop-blur-[0.5px]"
            aria-hidden
          />
        </>
      ) : (
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-background via-muted/20 to-background"
          aria-hidden
        />
      )}

      <div className="absolute left-1/2 top-2 z-30 -translate-x-1/2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-card-foreground backdrop-blur-sm">
        <span className="status-online mr-1.5 inline-block h-2 w-2 rounded-full" />
        {visibleOnlineCount} online
      </div>

      <div
        className="relative z-10 min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-4 pt-10"
        onScroll={handleMessagesScroll}
        ref={messagesDiv}
      >
        <div className="relative z-10 space-y-3">
          {loadingOlder ? (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Carregando mensagens antigas…
            </div>
          ) : null}

          {isLoading ? (
            <div className="flex h-full min-h-[120px] items-center justify-center text-sm text-muted-foreground">
              Carregando mensagens...
            </div>
          ) : realTimeMessages.length > 0 ? (
            realTimeMessages.map((message) => {
              const isMine = message.author_username === user?.username;
              const showNewMessagesDivider = newMessageId === message.id;

              return (
                <div key={message.id} className="relative">
                  {showNewMessagesDivider ? (
                    <div
                      id={`new-msg-${message.id}`}
                      className="mb-3 flex items-center gap-2 scroll-mt-28 px-1"
                    >
                      <div className="h-px min-w-[12px] flex-1 bg-neon-green/35" />
                      <span className="shrink-0 rounded-full border border-neon-green/35 bg-background/92 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neon-green shadow-md backdrop-blur-md">
                        Novas mensagens
                      </span>
                      <div className="h-px min-w-[12px] flex-1 bg-neon-green/35" />
                    </div>
                  ) : null}

                  <div
                    className={`flex min-w-0 gap-2 animate-message-fade-in ${
                      isMine ? "flex-row-reverse" : ""
                    }`}
                  >
                    {!isMine ? (
                      <ProfileImagePost
                        username={message.author_username}
                        displayName={message.author_name}
                        link_photo={message.author_profile_photo}
                        className="mt-1 h-8 w-8 flex-shrink-0 ring-1 ring-border"
                      />
                    ) : null}

                    <div
                      className={`min-w-0 max-w-[75%] ${isMine ? "items-end" : ""}`}
                    >
                      {!isMine ? (
                        <div className="mb-0.5 flex flex-col gap-0.5 md:flex-row md:items-center md:gap-2">
                          <span className="whitespace-nowrap text-sm font-bold text-foreground">
                            {message.author_name}
                          </span>
                        </div>
                      ) : null}

                      <div
                        className={`break-words whitespace-pre-wrap rounded-lg px-3 py-2 text-sm backdrop-blur-sm ${
                          isMine
                            ? "bg-primary text-primary-foreground"
                            : "bg-card/75 text-card-foreground"
                        }`}
                      >
                        {message.body}
                      </div>
                      <span
                        className={`mt-0.5 block text-[10px] text-white/70 ${
                          isMine ? "text-right" : ""
                        }`}
                      >
                        <DateAndHour date={message.created_at} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex h-full min-h-[120px] flex-col items-center justify-center text-center text-muted-foreground">
              <span className="text-xl font-semibold text-foreground">
                Parece que ainda não há mensagens nesta sala...
              </span>
              <p className="mt-1 text-sm">Seja o primeiro a enviar uma.</p>
            </div>
          )}

          {joinNotices.map((notice) => (
            <JoinNoticeChip
              key={notice.id}
              notice={notice}
              onDismiss={dismissJoinNotice}
            />
          ))}

          <div className="h-2" />
        </div>
      </div>

      {messagesQuantity > 0 ? (
        <button
          type="button"
          onClick={executeScrollToFirstNewMessage}
          className="absolute bottom-20 right-4 z-20 flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-2 text-xs font-semibold text-card-foreground shadow-lg backdrop-blur-sm transition-all hover:bg-card"
        >
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          Ir para mensagens novas
          {messagesQuantity > 1 ? (
            <span className="rounded-full bg-primary/15 px-1.5 py-0 text-[10px] font-bold text-primary">
              {messagesQuantity}
            </span>
          ) : null}
        </button>
      ) : !shouldScrollToBottom ? (
        <button
          type="button"
          onClick={executeScrollBottom}
          className="absolute bottom-20 right-4 z-20 flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-2 text-xs font-semibold text-card-foreground shadow-lg backdrop-blur-sm transition-all hover:bg-card"
        >
          <ArrowDown className="h-3.5 w-3.5" />
          Ir para o final
        </button>
      ) : null}

      <RoomChatInput />
    </div>
  );
}
