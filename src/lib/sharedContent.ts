const SHARE_MARKER = "PGTHER_SHARE";

export interface SharedCutContent {
  type: "cut";
  id: number;
  username: string;
  name: string;
  caption: string;
  thumbnail: string;
  duration: number | null;
}

export function encodeSharedCut(cut: {
  id: number;
  username: string;
  name: string;
  caption: string;
  thumbnail: string;
  duration: number | null;
}): string {
  const payload: SharedCutContent = {
    type: "cut",
    id: cut.id,
    username: cut.username,
    name: cut.name,
    caption: cut.caption,
    thumbnail: cut.thumbnail,
    duration: cut.duration ?? null,
  };
  return SHARE_MARKER + JSON.stringify(payload);
}

export function decodeSharedContent(content: string): SharedCutContent | null {
  if (!content.startsWith(SHARE_MARKER)) return null;
  try {
    const parsed = JSON.parse(content.slice(SHARE_MARKER.length));
    if (parsed && parsed.type === "cut") return parsed as SharedCutContent;
    return null;
  } catch {
    return null;
  }
}

export function sharedContentPreviewText(content: SharedCutContent): string {
  return `📹 Compartilhou um cut de @${content.username}`;
}
