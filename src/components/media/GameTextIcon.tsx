import { cn } from "@/lib/utils";

type GameTextIconSpec = {
  label: string;
  className: string;
};

// Riot API policy forbids official logos/marks, so Riot titles and the Riot
// company use text tiles instead of Cloudinary/official brand art.
const GAME_TEXT_ICONS: Record<string, GameTextIconSpec> = {
  lol: {
    label: "LoL",
    className: "bg-gradient-to-b from-[#0e1c30] to-[#060c18] text-[#c8aa6e]",
  },
  val: {
    label: "VAL",
    className: "bg-gradient-to-b from-[#20161e] to-[#0f1923] text-[#ff4655]",
  },
  riot: {
    label: "Riot",
    className: "bg-gradient-to-b from-[#2a1218] to-[#12080c] text-[#eb0029]",
  },
};

/** Cloudinary / DB paths that must never render as official Riot brand art. */
const RIOT_ASSET_PATH_ICONS: Array<{ match: string; key: keyof typeof GAME_TEXT_ICONS }> = [
  { match: "companies/riot", key: "riot" },
  { match: "games/lol/assets/icon", key: "lol" },
  { match: "games/val/assets/icon", key: "val" },
];

export type GameTextIconIdentity = {
  acronym?: string | null;
  name?: string | null;
};

/**
 * Identifica o jogo/empresa pelo acrônimo/nome (não pelo valor salvo no banco
 * para o ícone) — assim LoL/VAL/Riot sempre mostram a plaquinha de texto, mesmo
 * que o campo `icon`/`logo` ainda aponte para arte oficial no Cloudinary.
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
  if (name.includes("riot")) return GAME_TEXT_ICONS.riot;
  return null;
}

/** Fallback when callers only pass a media `src` (ex.: logo da empresa Riot). */
export function getGameTextIconFromSrc(
  src: string | null | undefined,
): GameTextIconSpec | null {
  if (!src) return null;
  const normalized = src.toLowerCase();
  for (const { match, key } of RIOT_ASSET_PATH_ICONS) {
    if (normalized.includes(match)) return GAME_TEXT_ICONS[key];
  }
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
