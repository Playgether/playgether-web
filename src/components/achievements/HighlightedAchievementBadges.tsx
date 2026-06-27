"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  rarityConfig,
  type RarityLevel,
} from "@/components/pages/profile/rarityConfig";
import { RarityAchievementChrome } from "@/components/pages/profile/ConquistText";
import { AchievementHoverPreviewCard } from "@/components/pages/profile/AchievementHoverPreviewCard";
import type { HighlightedAchievementPublic } from "@/types/highlightedAchievements";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const RARITY_SET = new Set<string>(Object.keys(rarityConfig));

function normalizeRarity(r: string): RarityLevel {
  return (RARITY_SET.has(r) ? r : "common") as RarityLevel;
}

function AchievementHighlightChip({
  achievement: a,
  className,
}: {
  achievement: HighlightedAchievementPublic;
  className?: string;
}) {
  const rarity = normalizeRarity(String(a.rarity));
  const cfg = rarityConfig[rarity];
  const reducedMotion = useReducedMotion() ?? false;
  const [hover, setHover] = useState(false);

  const iconNode = a.icon_image_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={a.icon_image_url}
      alt=""
      className="h-3.5 w-3.5 shrink-0 object-contain"
    />
  ) : (
    <span className="text-[11px] leading-none shrink-0" aria-hidden>
      {a.icon || "🏆"}
    </span>
  );

  const titleShort = a.title.length > 18 ? `${a.title.slice(0, 16)}…` : a.title;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.span
          className={cn("inline-flex max-w-full min-w-0 cursor-help", className)}
          onHoverStart={() => setHover(true)}
          onHoverEnd={() => setHover(false)}
          whileHover={
            !reducedMotion &&
            cfg.hoverScale > 1 &&
            !cfg.rotatingBorder
              ? { scale: Math.min(cfg.hoverScale, 1.04) }
              : {}
          }
          transition={{ duration: 0.2 }}
        >
          <RarityAchievementChrome
            rarity={rarity}
            isHovered={hover}
            isExpanded={false}
            reducedMotion={reducedMotion}
            staticBorder={false}
            variant="chip"
            className="min-w-0 max-w-full"
            contentClassName="relative z-10 flex items-center gap-1 max-w-full min-w-0 rounded-[calc(var(--radius)-2px)] px-1.5 py-[3px] subpixel-antialiased"
          >
            <span className={cn("flex shrink-0 items-center", cfg.textColor)}>
              {iconNode}
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-0.5 truncate text-[10px] font-semibold leading-tight">
              <span className="shrink-0 tabular-nums text-zinc-300 [transform:translateZ(0)]">
                {a.game_short}
              </span>
              <span className="shrink-0 text-zinc-400">·</span>
              <span className="min-w-0 truncate font-medium text-white [transform:translateZ(0)]">
                {titleShort}
              </span>
            </span>
          </RarityAchievementChrome>
        </motion.span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="z-[500] max-w-xs border-0 bg-transparent p-0 shadow-none overflow-visible text-left"
      >
        <AchievementHoverPreviewCard
          title={a.title}
          description={a.description}
          rarity={rarity}
          icon={a.icon}
          iconImageUrl={a.icon_image_url}
          game={a.game}
          date={a.date}
          percentage={a.percentage}
        />
      </TooltipContent>
    </Tooltip>
  );
}

export function HighlightedAchievementBadges({
  achievements,
  className,
  max = 3,
}: {
  achievements?: HighlightedAchievementPublic[] | null;
  className?: string;
  /** Limite de tags exibidas (API já envia no máx. 3). */
  max?: number;
}) {
  const list = (achievements ?? []).slice(0, max);
  if (list.length === 0) return null;

  return (
    <TooltipProvider delayDuration={280}>
      <div
        className={cn(
          "flex w-fit max-w-full flex-wrap items-center gap-1 min-w-0",
          className,
        )}
        aria-label="Conquistas em destaque"
      >
        {list.map((a) => (
          <AchievementHighlightChip key={a.id} achievement={a} />
        ))}
      </div>
    </TooltipProvider>
  );
}
