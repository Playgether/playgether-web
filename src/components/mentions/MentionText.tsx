"use client";

import { MentionLink } from "@/components/mentions/MentionLink";
import { splitMentionParts } from "@/lib/mentions";
import { cn } from "@/lib/utils";

export function MentionText({
  text,
  className,
  plainTextClassName,
}: {
  text: string | null | undefined;
  className?: string;
  plainTextClassName?: string;
}) {
  if (!text) return null;
  const parts = splitMentionParts(text);
  return (
    <span className={cn("whitespace-pre-wrap", className)}>
      {parts.map((part, index) =>
        part.type === "mention" ? (
          <MentionLink key={`${part.value}-${index}`} username={part.value} />
        ) : (
          <span key={index} className={plainTextClassName}>
            {part.value}
          </span>
        ),
      )}
    </span>
  );
}
