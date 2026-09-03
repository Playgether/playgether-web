export const MENTION_TOKEN_RE = /@([\w.-]+)/g;

export type MentionPart =
  | { type: "text"; value: string }
  | { type: "mention"; value: string };

export function splitMentionParts(text: string): MentionPart[] {
  if (!text) return [];
  const parts: MentionPart[] = [];
  let lastIndex = 0;
  const regex = new RegExp(MENTION_TOKEN_RE.source, "g");
  for (const match of text.matchAll(regex)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, index) });
    }
    parts.push({ type: "mention", value: match[1] });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }
  return parts;
}

export function getActiveMention(
  text: string,
  caret: number,
): { start: number; query: string } | null {
  const before = text.slice(0, caret);
  const match = before.match(/(^|[\s([{])@([\w.-]*)$/);
  if (!match) return null;
  return { start: before.lastIndexOf("@"), query: match[2] };
}

export function insertMention(
  text: string,
  caret: number,
  start: number,
  username: string,
): { next: string; caret: number } {
  const inserted = `@${username} `;
  const next = `${text.slice(0, start)}${inserted}${text.slice(caret)}`;
  return { next, caret: start + inserted.length };
}

export type MentionSuggestion = {
  id: number;
  username: string;
  name: string;
  profile_photo: string | null;
  verified?: boolean;
};
