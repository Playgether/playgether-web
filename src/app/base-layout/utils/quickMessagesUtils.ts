import { quickMessagesConfig } from "../config/quickMessages/quickMessagesConfig";

// Ex: 12s -> 11s
export function calculateTimeRemaining(time: string): string {
  const value = parseInt(time, 10);
  return value > 1 ? `${value - 1}s` : "0s";
}

export const needsAnimation = (el: HTMLParagraphElement | null) => {
  if (!el) return false;
  const containerWidth = el.parentElement?.offsetWidth || 0;
  return el.scrollWidth > containerWidth;
};

export const calculateAnimationDuration = (el: HTMLParagraphElement | null) => {
  if (!el) return 0;
  const containerWidth = el.parentElement?.offsetWidth || 0;
  const textWidth = el.scrollWidth;
  if (textWidth <= containerWidth) return 0;

  const extraWidth = textWidth - containerWidth;
  return 4 + extraWidth / 50;
};

export function isSameLocalCalendarDay(iso: string, now = new Date()): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function formatHistoryTimestamp(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function getPriorityColor(priority: "high" | "medium" | "low"): string {
  return quickMessagesConfig[priority]?.textPriority || "text-primary";
}

export const getPriorityClass = (priority: string) => {
  return quickMessagesConfig[priority]?.classPriority || "text-primary";
};
