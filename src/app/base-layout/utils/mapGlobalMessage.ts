import type { GlobalMessageDto } from "@/services/globalMessages";
import { resolvePlaygetherMediaUrl } from "@/lib/resolvePlaygetherMediaUrl";
import type { QuickMessage } from "@/app/base-layout/types/structure/QuickMessage";

function mapStatus(
  status: GlobalMessageDto["status"]
): QuickMessage["status"] {
  if (status === "completed") return "expired";
  if (status === "pending") return "pending";
  return "active";
}

export function mapGlobalMessageToQuickMessage(
  msg: GlobalMessageDto
): QuickMessage {
  const avatar =
    resolvePlaygetherMediaUrl(msg.author.profile_photo) || "";
  const remaining = Math.max(0, msg.remaining_seconds ?? msg.display_seconds);
  return {
    id: msg.id,
    user: {
      id: msg.author.id,
      name: msg.author.name || msg.author.username,
      username: msg.author.username,
      avatar,
    },
    message: msg.body,
    fullContent: msg.body,
    timeRemaining: `${remaining}s`,
    priority: msg.level,
    duration: msg.display_seconds,
    status: mapStatus(msg.status),
    timestamp: msg.ended_at || msg.started_at || msg.queued_at || "",
    expiresAt: msg.expires_at,
  };
}
