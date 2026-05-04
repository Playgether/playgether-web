"use client";

import { resolveGameMediaUrl } from "@/app/utils/getCloudinaryUrl";
import { getAmbientPeriodForNow } from "@/app/utils/roomAmbientPeriod";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import ProfileImagePost from "@/components/pages/feed/DesktopFeed/Middle/PostsComponents/ProfileImagePost/ProfileImagePost";
import { useAuthContext } from "@/context/AuthContext";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { usePresenceContext } from "@/context/PresenceContext";
import { ChatRoom } from "@/types/ChatRoom";
import { ChatRoomMessages } from "@/types/ChatRoomMessages";
import { ArrowDown, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import RoomChatInput from "./RoomChatInput";
import type { RoomJoinNotice } from "@/context/ChatHandlerContext";

function JoinNoticeLine({
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
    <div className="rounded-md border border-primary/25 bg-primary/10 px-3 py-1.5 text-center text-xs text-foreground">
      {notice.text}
    </div>
  );
}

interface RoomChatMessagesPanelProps {
  messages: ChatRoomMessages[];
  room: ChatRoom;
}

export default function RoomChatMessagesPanel({
  messages,
  room,
}: RoomChatMessagesPanelProps) {
  const [isLoading, setIsLoading] = useState(true);
  const {
    realTimeMessages,
    handleRealTimeMessages,
    messagesDiv,
    resetMessagesQuantity,
    messagesQuantity,
    handleScroll,
    shouldScrollToBottom,
    executeScrollBottom,
    newMessageId,
    onlineUsers,
    joinNotices,
    dismissJoinNotice,
  } = useChatHandlerContext();
  const { user } = useAuthContext();
  const presenceCtx = usePresenceContext();

  const selfId = user?.user_id != null ? Number(user.user_id) : null;

  const [timeTick, setTimeTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTimeTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const ambientBackgroundUrl = useMemo(() => {
    const period = getAmbientPeriodForNow();
    const raw = room.ambient_images?.[period];
    if (!raw || !String(raw).trim()) return null;
    return resolveGameMediaUrl(String(raw));
  }, [room.ambient_images, timeTick]);

  const visibleOnlineCount = useMemo(() => {
    if (!presenceCtx.isPresenceConnected) {
      return onlineUsers.length;
    }
    return onlineUsers.filter((u) => {
      if (selfId != null && u.id === selfId) return true;
      return presenceCtx.getPresence(u.id).status !== "offline";
    }).length;
  }, [onlineUsers, presenceCtx, selfId]);

  useEffect(() => {
    if (messages && messages.length > 0 && realTimeMessages.length === 0) {
      handleRealTimeMessages([...messages].reverse());
    }

    setIsLoading(false);
  }, [messages, realTimeMessages.length]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="absolute left-1/2 top-2 z-30 -translate-x-1/2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-card-foreground backdrop-blur-sm">
        <span className="status-online mr-1.5 inline-block h-2 w-2 rounded-full" />
        {visibleOnlineCount} online
      </div>

      <div
        className={`relative min-h-0 flex-1 overflow-y-auto p-4 pt-10 ${
          ambientBackgroundUrl
            ? ""
            : "bg-gradient-to-br from-background via-muted/20 to-background"
        }`}
        onScroll={handleScroll}
        ref={messagesQuantity === 1 ? messagesDiv : undefined}
      >
        {ambientBackgroundUrl ? (
          <>
            <div
              className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${ambientBackgroundUrl})` }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-background/88 via-background/72 to-background/88 backdrop-blur-[0.5px]"
              aria-hidden
            />
          </>
        ) : null}
        <div className="relative z-10 space-y-3">
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
                    id={`${message.id}`}
                    className="mb-2 flex items-center gap-2"
                  >
                    <div className="h-px flex-1 bg-neon-green/50" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neon-green">
                      Novas mensagens
                    </span>
                    <div className="h-px flex-1 bg-neon-green/50" />
                  </div>
                ) : null}

                <div
                  className={`flex gap-2 animate-message-fade-in ${
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
                    className={`max-w-[75%] ${isMine ? "items-end" : ""}`}
                  >
                    {!isMine ? (
                      <div className="mb-0.5 flex flex-col gap-0.5 md:flex-row md:items-center md:gap-2">
                        <span className="whitespace-nowrap text-sm font-bold text-foreground">
                          {message.author_name}
                        </span>
                      </div>
                    ) : null}

                    <div
                      className={`whitespace-pre-wrap rounded-lg px-3 py-2 text-sm backdrop-blur-sm ${
                        isMine
                          ? "bg-primary text-primary-foreground"
                          : "bg-card/75 text-card-foreground"
                      }`}
                    >
                      {message.body}
                    </div>
                    <span
                      className={`mt-0.5 block text-[10px] text-muted-foreground ${
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

        <div className="h-2" />
        </div>
      </div>

      {messagesQuantity > 0 ? (
        <button
          type="button"
          onClick={() => {
            executeScrollBottom();
            resetMessagesQuantity();
          }}
          className="absolute bottom-20 right-4 z-20 flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-2 text-xs font-semibold text-card-foreground shadow-lg backdrop-blur-sm transition-all hover:bg-card"
        >
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          {messagesQuantity} novas mensagens
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

      {joinNotices.length > 0 ? (
        <div className="shrink-0 space-y-1 border-t border-border/50 bg-background/95 px-3 py-2">
          {joinNotices.map((notice) => (
            <JoinNoticeLine
              key={notice.id}
              notice={notice}
              onDismiss={dismissJoinNotice}
            />
          ))}
        </div>
      ) : null}

      <RoomChatInput />
    </div>
  );
}
