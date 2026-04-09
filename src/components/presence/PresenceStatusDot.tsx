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
    case "dnd":
      return "status-away";
    default:
      return "status-offline";
  }
}

export function PresenceStatusDot({
  userId,
  sizeClass = "w-4 h-4",
  borderClass = "border-2 border-background",
  className,
}: {
  userId?: number;
  sizeClass?: string;
  borderClass?: string;
  className?: string;
}) {
  const ctx = useContext(PresenceContext);
  const { user } = useAuthContext();

  let st = "offline";
  if (ctx && userId != null) {
    const isSelf = user?.user_id === userId;
    st = ctx.getPresence(userId).status;
    if (isSelf) {
      if (!ctx.isPresenceConnected) st = "offline";
      else if (st !== "away" && st !== "dnd") st = "online";
    }
  }

  return (
    <span
      className={cn(
        "absolute -bottom-0.5 -right-0.5 rounded-full shrink-0 block",
        sizeClass,
        borderClass,
        statusClass(st),
        className,
      )}
      title={st}
      aria-hidden
    />
  );
}
