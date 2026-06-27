import { cn } from "@/lib/utils";
import { rarityConfig, type RarityLevel } from "./rarityConfig";

export function RarityLevelDot({
  rarity,
  className,
}: {
  rarity: RarityLevel;
  className?: string;
}) {
  const config = rarityConfig[rarity];
  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full ring-1 ring-white/15",
        className,
      )}
      style={{ background: config.badgeGradient }}
      aria-hidden
    />
  );
}
