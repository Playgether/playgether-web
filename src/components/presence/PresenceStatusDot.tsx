"use client";

import { useContext } from "react";
import { PresenceContext } from "@/context/PresenceContext";
import { useAuthContext } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

function statusClass(s: string) {
  switch (s) {
    case "online":
      return "status-online";
    case "away":
      return "status-away";
    case "dnd":
      return "status-dnd";
    default:
      return "status-offline";
  }
}

export function PresenceStatusDot({
  userId,
  sizeClass = "w-4 h-4",
  borderClass = "border-2 border-background",
  className,
  /** Só tem efeito no próprio usuário: abre o seletor de status. */
  allowPicker = false,
}: {
  userId?: string | number;
  sizeClass?: string;
  borderClass?: string;
  className?: string;
  allowPicker?: boolean;
}) {
  const ctx = useContext(PresenceContext);
  const { user } = useAuthContext();

  const selfId = user?.user_id != null ? String(user.user_id) : null;
  const uid = userId != null ? String(userId) : null;
  const isSelf = selfId != null && uid != null && selfId === uid;

  let st = "offline";
  if (ctx && uid != null) {
    st = isSelf
      ? ctx.getSelfPresenceDisplay().status
      : ctx.getPresence(uid).status;
  }

  const shared = cn(
    "absolute -bottom-1 -right-1 rounded-full shrink-0 block z-10",
    sizeClass,
    borderClass,
    statusClass(st),
    className,
  );

  if (allowPicker && isSelf && ctx) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          ctx.openPresencePicker();
        }}
        className={cn(
          shared,
          "cursor-pointer p-0 m-0 border-solid",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
        aria-label="Alterar seu status de presença"
        title={st}
      />
    );
  }

  return (
    <span className={shared} title={st} aria-hidden />
  );
}
