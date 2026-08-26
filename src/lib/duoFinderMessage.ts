export type DuoReplyDraft = {
  gameName: string;
  matchPercent: number;
  partnerUsername: string;
  partnerName: string;
  partnerAvatar?: string | null;
};

export const DUO_MESSAGE_PREFIX =
  /^Via Duo Finder · ([^\n]+?)(?: \((\d+)% match\))?:\n\n([\s\S]*)$/;

export function formatDuoFinderMessage(draft: DuoReplyDraft, body: string): string {
  const header = `Via Duo Finder · ${draft.gameName} (${draft.matchPercent}% match)`;
  return `${header}:\n\n${body.trim()}`;
}

export function parseDuoFinderMessage(content: string): {
  gameLabel: string;
  matchPercent: number | null;
  reply: string;
} | null {
  const trimmed = content.trim();
  const match = trimmed.match(DUO_MESSAGE_PREFIX);
  if (!match) return null;
  return {
    gameLabel: match[1].trim(),
    matchPercent: match[2] ? Number(match[2]) : null,
    reply: (match[3] ?? "").trim(),
  };
}
