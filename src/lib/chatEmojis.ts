import { EMOJI_SEARCH_KEYWORDS } from "./chatEmojiSearchIndex";

/** Emojis usados nos pickers de chat (transmissão e, no futuro, conversas da sala). */
export type ChatEmojiCategory = {
  id: string;
  label: string;
  /** Ícone da aba (emoji em escala de cinza quando inativo). */
  tabIcon: string;
  /** Termos extras para a busca por categoria inteira. */
  searchTerms?: readonly string[];
  emojis: readonly string[];
};

function normSearch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export const CHAT_EMOJI_CATEGORIES: readonly ChatEmojiCategory[] = [
  {
    id: "faces",
    label: "Rostos",
    tabIcon: "🙂",
    searchTerms: ["rosto", "cara", "feliz", "triste", "riso", "emoji"],
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
      "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
      "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔",
      "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥",
      "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮",
      "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓",
      "🧐", "😕", "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺",
      "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣",
      "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬",
    ],
  },
  {
    id: "gestures",
    label: "Gestos",
    tabIcon: "👋",
    searchTerms: ["mao", "dedo", "joinha", "ok", "gesto"],
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞",
      "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍",
      "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝",
      "🙏", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠",
      "🫀", "🫁", "🦷", "🦴", "👀", "👁️", "👅", "👄",
    ],
  },
  {
    id: "hearts",
    label: "Corações",
    tabIcon: "❤️",
    searchTerms: ["amor", "coracao", "beijo", "romance"],
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️",
      "💋", "💌", "💐", "🌹", "🥀", "🌷", "🌸", "💮", "🏵️", "🌺",
    ],
  },
  {
    id: "fun",
    label: "Diversão",
    tabIcon: "🎮",
    searchTerms: ["jogo", "musica", "esporte", "trofeu", "diversao"],
    emojis: [
      "🎮", "🕹️", "🎯", "🎲", "🧩", "♟️", "🎭", "🎨", "🎬", "🎤",
      "🎧", "🎼", "🎹", "🥁", "🎷", "🎺", "🎸", "🪕", "🎻", "🎵",
      "🎶", "🎙️", "📺", "📻", "🎥", "📷", "📸", "🎞️", "📽️", "🎬",
      "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "⚽", "🏀", "🏈", "⚾",
      "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🥊", "🥋", "🥅", "⛳",
    ],
  },
  {
    id: "objects",
    label: "Objetos",
    tabIcon: "✨",
    searchTerms: [
      "fogo",
      "estrela",
      "festa",
      "comida",
      "bebida",
      "drink",
      "alcool",
      "vinho",
      "cerveja",
    ],
    emojis: [
      "🔥", "💯", "✨", "⭐", "🌟", "💫", "⚡", "💥", "💢", "💦",
      "💨", "🌈", "☀️", "🌙", "🌠", "🎉", "🎊", "🎈", "🎁",
      "🎀", "🪅", "🎃", "🎄", "🎆", "🎇", "🧨", "✅", "❌", "❓",
      "❗", "‼️", "💤", "💬", "🗯️", "💭", "🕳️",
      "☕", "🍵", "🧋", "🍿", "🍕", "🍔", "🌮", "🌭", "🍟",
      "🍩", "🍰", "🎂", "🍦", "🍫", "🍎", "🍌", "🍉", "🍇", "🥑",
      "🍺", "🍻", "🍷", "🥂", "🍾", "🥃", "🍹", "🥤", "🧃",
      "🚀", "🛸", "👑", "💎", "🤡", "👻", "💀", "☠️", "👽", "🤖", "😈", "👿",
    ],
  },
  {
    id: "animals",
    label: "Animais",
    tabIcon: "🐻",
    searchTerms: ["animal", "cachorro", "gato", "pet", "bicho"],
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
      "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐔", "🐧",
      "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄",
      "🐝", "🪱", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷️",
      "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🐠",
    ],
  },
] as const;

/** Lista plana (útil para busca rápida ou compat). */
export const CHAT_EMOJI_FLAT: readonly string[] = CHAT_EMOJI_CATEGORIES.flatMap(
  (c) => c.emojis,
);

const CATALOG_SET = new Set(
  CHAT_EMOJI_CATEGORIES.flatMap((c) => c.emojis),
);

function queryTokens(q: string): string[] {
  const n = normSearch(q);
  if (!n) return [];
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length > 1) return parts.filter((t) => t.length >= 2);
  return parts;
}

function termMatchesQuery(term: string, tokens: string[], fullQ: string): boolean {
  const t = normSearch(term);
  if (!t) return false;
  if (tokens.length === 0) {
    return t.includes(fullQ) || fullQ.includes(t);
  }
  return tokens.some(
    (tok) =>
      t.includes(tok) ||
      tok.includes(t) ||
      t.split(/\s+/).some((part) => part.startsWith(tok) || tok.startsWith(part)),
  );
}

/** Busca por palavra-chave por emoji + fallback por categoria. */
export function searchChatEmojis(query: string): string[] {
  const fullQ = normSearch(query);
  if (!fullQ) return [];
  const tokens = queryTokens(query);
  const out = new Set<string>();

  for (const [emoji, keywords] of Object.entries(EMOJI_SEARCH_KEYWORDS)) {
    if (keywords.some((kw) => termMatchesQuery(kw, tokens, fullQ))) {
      out.add(emoji);
    }
  }

  for (const cat of CHAT_EMOJI_CATEGORIES) {
    const haystack = [cat.label, cat.id, ...(cat.searchTerms ?? [])];
    if (haystack.some((h) => termMatchesQuery(h, tokens, fullQ))) {
      for (const e of cat.emojis) out.add(e);
    }
  }

  return [...out].filter((e) => CATALOG_SET.has(e));
}
