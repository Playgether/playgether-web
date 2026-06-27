"use client";

import { useReducedMotion } from "framer-motion";
import {
  RarityAchievementChrome,
  RarityBadge,
} from "@/components/pages/profile/ConquistText";
import {
  rarityConfig,
  type RarityLevel,
} from "@/components/pages/profile/rarityConfig";
import { cn } from "@/lib/utils";

export function AchievementHoverPreviewCard({
  title,
  description,
  rarity,
  icon,
  iconImageUrl,
  game,
  date,
  percentage,
  className,
}: {
  title: string;
  description: string;
  rarity: RarityLevel;
  icon?: string;
  iconImageUrl?: string | null;
  game: string;
  date?: string | null;
  percentage?: number;
  className?: string;
}) {
  const cfg = rarityConfig[rarity];
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <RarityAchievementChrome
      rarity={rarity}
      isHovered
      isExpanded
      reducedMotion={reducedMotion}
      staticBorder={false}
      variant="card"
      className={cn("w-full max-w-xs rounded-xl", className)}
      contentClassName="relative z-10 space-y-2 p-3 text-left"
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg leading-none",
            cfg.textColor,
          )}
          style={{
            background: `${cfg.staticBorderColor}22`,
            border: `1px solid ${cfg.staticBorderColor}66`,
          }}
        >
          {iconImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={iconImageUrl}
              alt=""
              className="h-5 w-5 object-contain"
            />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center text-[1.35rem] leading-none"
              aria-hidden
            >
              {icon || "🏆"}
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 pr-1">
              <p className="font-semibold text-sm leading-snug text-white subpixel-antialiased [transform:translateZ(0)]">
                {title}
              </p>
              <p className="text-xs text-zinc-300">{game}</p>
            </div>
            <RarityBadge
              config={cfg}
              rarity={rarity}
              isHovered
              reducedMotion={reducedMotion}
            />
          </div>
        </div>
      </div>
      {date ? (
        <p className="text-xs text-zinc-300">Desbloqueada: {date}</p>
      ) : null}
      <p className="text-xs leading-relaxed text-zinc-300">{description}</p>
      {percentage != null && percentage > 0 ? (
        <p className="text-[11px] text-zinc-300">
          ~{percentage.toFixed(1)}% dos jogadores
        </p>
      ) : null}
    </RarityAchievementChrome>
  );
}
