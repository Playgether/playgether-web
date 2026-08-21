"use client";

import type { ReactNode } from "react";
import { X, Swords } from "lucide-react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { NotificationMessageText } from "@/app/base-layout/config/notifications/NotificationMessageText";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/context/NotificationsContext";

const MAX_VISIBLE_ACTORS = 2;

export function isDuoNotification(notification: NotificationItem) {
  return (
    notification.notification_type === "duo" ||
    notification.actors[0]?.username === "duo"
  );
}

function NotificationMessage({
  notification,
  isDuo,
}: {
  notification: NotificationItem;
  isDuo: boolean;
}) {
  if (isDuo) {
    return (
      <p className="text-sm leading-snug text-pretty text-foreground">
        <span className="font-semibold text-primary">Duo</span>{" "}
        {notification.message}
      </p>
    );
  }

  const colonIndex = notification.message.indexOf(":");
  if (colonIndex === -1) {
    return (
      <p className="line-clamp-2 text-sm leading-snug text-pretty text-foreground">
        <NotificationMessageText text={notification.message} />
      </p>
    );
  }

  const title = notification.message.slice(0, colonIndex).trim();
  const extra = notification.message.slice(colonIndex + 1).trim();

  return (
    <>
      <p className="line-clamp-2 text-sm leading-snug text-pretty text-foreground">
        <NotificationMessageText text={title} />
      </p>
      {extra ? (
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
          {extra}
        </p>
      ) : null}
    </>
  );
}

function NotificationActors({
  actors,
  isDuo,
}: {
  actors: NotificationItem["actors"];
  isDuo: boolean;
}) {
  if (isDuo) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary ring-1 ring-background">
        <Swords className="h-4 w-4 text-white" />
      </div>
    );
  }

  const visible = actors.slice(0, MAX_VISIBLE_ACTORS);
  const stacked = visible.length > 1;

  if (!stacked) {
    const actor = visible[0];
    if (!actor) return null;
    return (
      <ProfileAvatar
        displayName={actor.name}
        username={actor.username}
        profilePhoto={actor.profile_photo ?? null}
        sizeClass="h-9 w-9"
        className="ring-1 ring-background"
        fallbackTextClassName="text-xs"
      />
    );
  }

  return (
    <div className="relative h-9 w-11 shrink-0">
      {visible.map((actor, index) => (
        <div
          key={`${actor.username}-${index}`}
          className={cn(
            "absolute top-0",
            index === 0 ? "left-0 z-[1]" : "left-3.5 z-0",
          )}
        >
          <ProfileAvatar
            displayName={actor.name}
            username={actor.username}
            profilePhoto={actor.profile_photo ?? null}
            sizeClass="h-9 w-9"
            className="border border-background ring-1 ring-background"
            fallbackTextClassName="text-[10px]"
          />
        </div>
      ))}
    </div>
  );
}

type NotificationListItemProps = {
  notification: NotificationItem;
  index?: number;
  timeLabel: ReactNode;
  onMarkAsRead: (notification: NotificationItem) => void;
  onClick: (notification: NotificationItem) => void;
  onDelete: (notification: NotificationItem) => void;
};

export function NotificationListItem({
  notification,
  index = 0,
  timeLabel,
  onMarkAsRead,
  onClick,
  onDelete,
}: NotificationListItemProps) {
  const isDuo = isDuoNotification(notification);
  const clickable = Boolean(notification.action_url);

  return (
    <div
      role={clickable ? "link" : "button"}
      tabIndex={0}
      onPointerEnter={() => onMarkAsRead(notification)}
      onFocus={() => onMarkAsRead(notification)}
      onClick={() => onClick(notification)}
      onKeyDown={(e) => {
        if (clickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick(notification);
        }
      }}
      className={cn(
        "group flex min-w-0 items-center gap-3 rounded-xl p-2.5 transition-all duration-200 animate-slide-up",
        clickable ? "cursor-pointer" : "cursor-default",
        notification.is_read
          ? "bg-muted/50 hover:bg-muted/70"
          : "border border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/15 hover:to-secondary/15",
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative shrink-0">
        <NotificationActors actors={notification.actors} isDuo={isDuo} />
        {!notification.is_read ? (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gradient-primary animate-glow-pulse" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <NotificationMessage notification={notification} isDuo={isDuo} />
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {timeLabel}
        </span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification);
        }}
        aria-label="Excluir notificação"
        className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
