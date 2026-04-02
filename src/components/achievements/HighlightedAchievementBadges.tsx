"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  rarityConfig,
  type RarityLevel,
} from "@/components/pages/profile/rarityConfig";
import {
  RarityAchievementChrome,
  RarityBadge,
} from "@/components/pages/profile/ConquistText";
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
      className="h-3.5 w-3.5 object-contain shrink-0"
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
          className={cn("inline-flex max-w-full min-w-0 cursor-default", className)}
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
          style={{ willChange: "transform" }}
        >
          <RarityAchievementChrome
            rarity={rarity}
            isHovered={hover}
            isExpanded={false}
            reducedMotion={reducedMotion}
            staticBorder={false}
            variant="chip"
            className="min-w-0 max-w-full"
            contentClassName="relative z-10 flex items-center gap-1 max-w-full min-w-0 rounded-[calc(var(--radius)-2px)] px-1.5 py-0.5"
          >
            <span className={cn("shrink-0 flex items-center", cfg.textColor)}>
              {iconNode}
            </span>
            <span className="text-[10px] font-semibold leading-tight truncate flex items-baseline gap-0.5 min-w-0 flex-1">
              <span className="tabular-nums text-white/80 shrink-0">
                {a.game_short}
              </span>
              <span className="text-white/50 font-normal shrink-0">·</span>
              <span className="truncate font-medium text-white">{titleShort}</span>
            </span>
          </RarityAchievementChrome>
        </motion.span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs border-0 bg-transparent p-0 shadow-none overflow-visible text-left"
      >
        <RarityAchievementChrome
          rarity={rarity}
          isHovered
          isExpanded
          reducedMotion={reducedMotion}
          staticBorder={false}
          variant="card"
          className="w-full max-w-xs rounded-xl"
          contentClassName="relative z-10 space-y-2 p-3 text-left"
        >
          <div className="flex items-start gap-2">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg",
                cfg.textColor,
              )}
              style={{
                background: `${cfg.staticBorderColor}22`,
                border: `1px solid ${cfg.staticBorderColor}66`,
              }}
            >
              {a.icon_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.icon_image_url}
                  alt=""
                  className="h-5 w-5 object-contain"
                />
              ) : (
                <span aria-hidden>{a.icon || "🏆"}</span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 pr-1">
                  <p className="font-semibold text-sm leading-snug text-white">
                    {a.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{a.game}</p>
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
          {a.date ? (
            <p className="text-xs text-muted-foreground">
              Desbloqueada: {a.date}
            </p>
          ) : null}
          <p className="text-xs leading-relaxed text-muted-foreground">
            {a.description}
          </p>
          {a.percentage > 0 ? (
            <p className="text-[11px] text-muted-foreground">
              ~{a.percentage.toFixed(1)}% dos jogadores
            </p>
          ) : null}
        </RarityAchievementChrome>
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
        className={cn("flex flex-wrap items-center gap-1 min-w-0", className)}
        aria-label="Conquistas em destaque"
      >
        {list.map((a) => (
          <AchievementHighlightChip key={a.id} achievement={a} />
        ))}
      </div>
    </TooltipProvider>
  );
}
