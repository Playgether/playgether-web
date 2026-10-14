import { cn } from "@/lib/utils";

type GameTextIconSpec = {
  label: string;
  className: string;
};

// Riot API policy forbids official game logos, so Riot games get a text tile instead of their logo art.
const GAME_TEXT_ICONS: Record<string, GameTextIconSpec> = {
  lol: {
    label: "LoL",
    className: "bg-gradient-to-b from-[#0e1c30] to-[#060c18] text-[#c8aa6e]",
  },
  val: {
    label: "VAL",
    className: "bg-gradient-to-b from-[#20161e] to-[#0f1923] text-[#ff4655]",
  },
};

export type GameTextIconIdentity = {
  acronym?: string | null;
  name?: string | null;
};

/**
 * Identifica o jogo pelo acrônimo/nome (não pelo valor salvo no banco para o
 * ícone) — assim LoL/VAL sempre mostram a plaquinha de texto, mesmo que o
 * campo `icon` esteja vazio ou quebrado no Cloudinary.
 */
export function getGameTextIcon(
  identity: GameTextIconIdentity | null | undefined,
): GameTextIconSpec | null {
  if (!identity) return null;
  const acronym = (identity.acronym ?? "").trim().toLowerCase();
  if (acronym && GAME_TEXT_ICONS[acronym]) return GAME_TEXT_ICONS[acronym];
  const name = (identity.name ?? "").toLowerCase();
  if (name.includes("league of legends")) return GAME_TEXT_ICONS.lol;
  if (name.includes("valorant")) return GAME_TEXT_ICONS.val;
  return null;
}

export function GameTextIcon({
  spec,
  alt,
  className,
}: {
  spec: GameTextIconSpec;
  alt: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={alt || spec.label}
      className={cn(
        "flex select-none items-center justify-center overflow-hidden font-black leading-none tracking-tight [container-type:inline-size]",
        spec.className,
        className,
      )}
    >
      <span className="text-[length:34cqw]">{spec.label}</span>
    </div>
  );
}
