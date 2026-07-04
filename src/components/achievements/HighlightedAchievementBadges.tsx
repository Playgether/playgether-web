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
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { usePrefersTouch } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const RARITY_SET = new Set<string>(Object.keys(rarityConfig));

const PREVIEW_CONTENT_CLASS =
  "z-[500] max-w-xs border-0 bg-transparent p-0 shadow-none overflow-visible text-left";

function normalizeRarity(r: string): RarityLevel {
  return (RARITY_SET.has(r) ? r : "common") as RarityLevel;
}

function AchievementPreview({
  achievement: a,
  rarity,
}: {
  achievement: HighlightedAchievementPublic;
  rarity: RarityLevel;
}) {
  return (
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
  );
}

function AchievementChipBody({
  achievement: a,
  rarity,
  cfg,
  compact,
  isHovered,
  isExpanded,
  className,
  onHoverStart,
  onHoverEnd,
}: {
  achievement: HighlightedAchievementPublic;
  rarity: RarityLevel;
  cfg: (typeof rarityConfig)[RarityLevel];
  compact: boolean;
  isHovered: boolean;
  isExpanded: boolean;
  className?: string;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}) {
  const reducedMotion = useReducedMotion() ?? false;

  const iconNode = a.icon_image_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={a.icon_image_url}
      alt=""
      className={cn("shrink-0 object-contain", compact ? "h-3 w-3" : "h-3.5 w-3.5")}
    />
  ) : (
    <span
      className={cn("leading-none shrink-0", compact ? "text-[10px]" : "text-[11px]")}
      aria-hidden
    >
      {a.icon || "🏆"}
    </span>
  );

  const titleLimit = compact ? 12 : 18;
  const titleShort =
    a.title.length > titleLimit ? `${a.title.slice(0, titleLimit - 1)}…` : a.title;

  return (
    <motion.span
      className={cn(
        "inline-flex min-w-0 max-w-full shrink-0",
        isHovered || isExpanded ? "cursor-pointer" : "cursor-help",
        className,
      )}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      whileHover={
        onHoverStart &&
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
        isHovered={isHovered}
        isExpanded={isExpanded}
        reducedMotion={reducedMotion}
        staticBorder={false}
        variant="chip"
        className="min-w-0 max-w-full"
        contentClassName={cn(
          "relative z-10 flex min-w-0 max-w-full items-center gap-1 rounded-[calc(var(--radius)-2px)] subpixel-antialiased",
          compact ? "px-1 py-0.5" : "px-1.5 py-[3px]",
        )}
      >
        <span className={cn("flex shrink-0 items-center", cfg.textColor)}>
          {iconNode}
        </span>
        <span
          className={cn(
            "flex min-w-0 items-center gap-0.5 truncate font-semibold leading-tight",
            compact ? "text-[9px] sm:text-[10px]" : "text-[10px]",
          )}
        >
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
  );
}

function AchievementHighlightChipTouch({
  achievement: a,
  className,
  compact = false,
}: {
  achievement: HighlightedAchievementPublic;
  className?: string;
  compact?: boolean;
}) {
  const rarity = normalizeRarity(String(a.rarity));
  const cfg = rarityConfig[rarity];
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <button
          type="button"
          className={cn(
            "relative z-20 inline-flex min-w-0 max-w-full shrink-0 touch-manipulation border-0 bg-transparent p-0 text-left",
            className,
          )}
          aria-expanded={open}
          aria-label={`Ver conquista: ${a.title}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
        >
          <AchievementChipBody
            achievement={a}
            rarity={rarity}
            cfg={cfg}
            compact={compact}
            isHovered={open}
            isExpanded={open}
          />
        </button>
      </PopoverAnchor>
      <PopoverContent
        side="top"
        align="start"
        className={PREVIEW_CONTENT_CLASS}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <AchievementPreview achievement={a} rarity={rarity} />
      </PopoverContent>
    </Popover>
  );
}

function AchievementHighlightChipHover({
  achievement: a,
  className,
  compact = false,
}: {
  achievement: HighlightedAchievementPublic;
  className?: string;
  compact?: boolean;
}) {
  const rarity = normalizeRarity(String(a.rarity));
  const cfg = rarityConfig[rarity];
  const [hover, setHover] = useState(false);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <AchievementChipBody
          achievement={a}
          rarity={rarity}
          cfg={cfg}
          compact={compact}
          isHovered={hover}
          isExpanded={false}
          className={className}
          onHoverStart={() => setHover(true)}
          onHoverEnd={() => setHover(false)}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className={PREVIEW_CONTENT_CLASS}>
        <AchievementPreview achievement={a} rarity={rarity} />
      </TooltipContent>
    </Tooltip>
  );
}

function AchievementHighlightChip({
  achievement,
  className,
  compact = false,
}: {
  achievement: HighlightedAchievementPublic;
  className?: string;
  compact?: boolean;
}) {
  const prefersTouch = usePrefersTouch();

  if (prefersTouch) {
    return (
      <AchievementHighlightChipTouch
        achievement={achievement}
        className={className}
        compact={compact}
      />
    );
  }

  return (
    <AchievementHighlightChipHover
      achievement={achievement}
      className={className}
      compact={compact}
    />
  );
}

export function HighlightedAchievementBadges({
  achievements,
  className,
  max = 3,
  compact = false,
}: {
  achievements?: HighlightedAchievementPublic[] | null;
  className?: string;
  /** Limite de tags exibidas (API já envia no máx. 3). */
  max?: number;
  compact?: boolean;
}) {
  const list = (achievements ?? []).slice(0, max);
  if (list.length === 0) return null;

  return (
    <TooltipProvider delayDuration={280}>
      <div
        className={cn(
          "relative z-20 flex min-w-0 flex-wrap items-center gap-1",
          "w-fit max-w-full",
          className,
        )}
        aria-label="Conquistas em destaque"
      >
        {list.map((a) => (
          <AchievementHighlightChip key={a.id} achievement={a} compact={compact} />
        ))}
      </div>
    </TooltipProvider>
  );
}
