import { cn } from "@/lib/utils";

type GameTextIconSpec = {
  label: string;
  className: string;
};

// Riot API policy forbids official game logos, so Riot games get a text tile instead of their logo art.
const GAME_TEXT_ICONS: Record<string, GameTextIconSpec> = {
  "games/lol/assets/icon": {
    label: "LoL",
    className: "bg-gradient-to-b from-[#0e1c30] to-[#060c18] text-[#c8aa6e]",
  },
  "games/val/assets/icon": {
    label: "VAL",
    className: "bg-gradient-to-b from-[#20161e] to-[#0f1923] text-[#ff4655]",
  },
};

export function getGameTextIcon(src: string | null | undefined): GameTextIconSpec | null {
  if (!src) return null;
  const key = Object.keys(GAME_TEXT_ICONS).find((id) => src.includes(id));
  return key ? GAME_TEXT_ICONS[key] : null;
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
