"use client";

import { memo, useMemo, useState } from "react";
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
import { useCanHover } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const RARITY_SET = new Set<string>(Object.keys(rarityConfig));

const PREVIEW_CONTENT_CLASS =
  "z-[500] max-w-xs border-0 bg-transparent p-0 shadow-none overflow-visible text-left";

const DEFAULT_TITLE_MAX_CHARS = 18;

const BadgesRow = memo(function BadgesRow({
  list,
  compact,
  iconOnly,
  titleMaxChars,
  overflow,
  showOverflowCounter,
}: {
  list: HighlightedAchievementPublic[];
  compact: boolean;
  iconOnly: boolean;
  titleMaxChars: number;
  overflow: number;
  showOverflowCounter: boolean;
}) {
  return (
    <>
      {list.map((a) => (
        <AchievementHighlightChip
          key={a.id}
          achievement={a}
          compact={compact || iconOnly}
          iconOnly={iconOnly}
          titleMaxChars={titleMaxChars}
        />
      ))}
      {showOverflowCounter && overflow > 0 ? (
        <span
          className="shrink-0 rounded-full bg-muted/80 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground"
          title={`${overflow} conquista${overflow === 1 ? "" : "s"} a mais`}
        >
          +{overflow}
        </span>
      ) : null}
    </>
  );
});

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
  iconOnly = false,
  titleMaxChars = 18,
  isHovered,
  isExpanded,
  className,
}: {
  achievement: HighlightedAchievementPublic;
  rarity: RarityLevel;
  cfg: (typeof rarityConfig)[RarityLevel];
  compact: boolean;
  iconOnly?: boolean;
  titleMaxChars?: number;
  isHovered: boolean;
  isExpanded: boolean;
  className?: string;
}) {
  const reducedMotion = useReducedMotion() ?? false;

  const iconNode = a.icon_image_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={a.icon_image_url}
      alt=""
      className={cn(
        "shrink-0 object-contain",
        iconOnly ? "h-2 w-2" : compact ? "h-3 w-3" : "h-3.5 w-3.5",
      )}
    />
  ) : (
    <span
      className={cn(
        "leading-none shrink-0",
        iconOnly ? "text-[8px]" : compact ? "text-[10px]" : "text-[11px]",
      )}
      aria-hidden
    >
      {a.icon || "🏆"}
    </span>
  );

  if (iconOnly) {
    return (
      <motion.span
        className={cn("inline-flex shrink-0", className)}
        animate={
          !reducedMotion &&
          (isHovered || isExpanded) &&
          cfg.hoverScale > 1 &&
          !cfg.rotatingBorder
            ? { scale: Math.min(cfg.hoverScale, 1.06) }
            : { scale: 1 }
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
          chipShape="circle"
          contentClassName="relative z-10 flex h-4 w-4 items-center justify-center rounded-full p-0"
        >
          <span
            className={cn("flex items-center justify-center", cfg.textColor)}
          >
            {iconNode}
          </span>
        </RarityAchievementChrome>
      </motion.span>
    );
  }

  const titleShort =
    a.title.length > titleMaxChars
      ? `${a.title.slice(0, Math.max(1, titleMaxChars - 1))}…`
      : a.title;

  return (
    <motion.span
      className={cn("inline-flex min-w-0 max-w-full shrink-0", className)}
      animate={
        !reducedMotion &&
        (isHovered || isExpanded) &&
        cfg.hoverScale > 1 &&
        !cfg.rotatingBorder
          ? { scale: Math.min(cfg.hoverScale, 1.04) }
          : { scale: 1 }
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
            "flex min-w-0 items-center gap-0.5 font-semibold leading-tight",
            compact ? "text-[9px] sm:text-[10px]" : "text-[10px]",
          )}
        >
          <span className="shrink-0 tabular-nums text-zinc-300 [transform:translateZ(0)]">
            {a.game_short}
          </span>
          <span className="shrink-0 text-zinc-400">·</span>
          <span className="min-w-0 whitespace-nowrap font-medium text-white [transform:translateZ(0)]">
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
  iconOnly = false,
  titleMaxChars = 18,
}: {
  achievement: HighlightedAchievementPublic;
  className?: string;
  compact?: boolean;
  iconOnly?: boolean;
  titleMaxChars?: number;
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
            iconOnly={iconOnly}
            titleMaxChars={titleMaxChars}
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
  iconOnly = false,
  titleMaxChars = 18,
}: {
  achievement: HighlightedAchievementPublic;
  className?: string;
  compact?: boolean;
  iconOnly?: boolean;
  titleMaxChars?: number;
}) {
  const rarity = normalizeRarity(String(a.rarity));
  const cfg = rarityConfig[rarity];
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open} onOpenChange={setOpen} delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative z-20 inline-flex min-w-0 max-w-full shrink-0 cursor-help border-0 bg-transparent p-0 text-left",
            className,
          )}
          aria-label={`Conquista: ${a.title}`}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <AchievementChipBody
            achievement={a}
            rarity={rarity}
            cfg={cfg}
            compact={compact}
            iconOnly={iconOnly}
            titleMaxChars={titleMaxChars}
            isHovered={open}
            isExpanded={false}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className={PREVIEW_CONTENT_CLASS}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <AchievementPreview achievement={a} rarity={rarity} />
      </TooltipContent>
    </Tooltip>
  );
}

const AchievementHighlightChip = memo(function AchievementHighlightChip({
  achievement,
  className,
  compact = false,
  iconOnly = false,
  titleMaxChars = 18,
}: {
  achievement: HighlightedAchievementPublic;
  className?: string;
  compact?: boolean;
  iconOnly?: boolean;
  titleMaxChars?: number;
}) {
  const canHover = useCanHover();

  if (canHover) {
    return (
      <AchievementHighlightChipHover
        achievement={achievement}
        className={className}
        compact={compact}
        iconOnly={iconOnly}
        titleMaxChars={titleMaxChars}
      />
    );
  }

  return (
    <AchievementHighlightChipTouch
      achievement={achievement}
      className={className}
      compact={compact}
      iconOnly={iconOnly}
      titleMaxChars={titleMaxChars}
    />
  );
});

export function HighlightedAchievementBadges({
  achievements,
  className,
  max = 3,
  compact = false,
  iconOnly = true,
  showOverflowCounter = false,
}: {
  achievements?: HighlightedAchievementPublic[] | null;
  className?: string;
  max?: number;
  compact?: boolean;
  iconOnly?: boolean;
  showOverflowCounter?: boolean;
}) {
  const all = achievements ?? [];
  const list = useMemo(() => all.slice(0, max), [all, max]);
  const overflow = all.length - list.length;
  const resolvedIconOnly = iconOnly;
  const resolvedCompact = compact || resolvedIconOnly;

  if (list.length === 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn("relative z-20 min-w-0 max-w-full bg-transparent", className)}
        aria-label="Conquistas em destaque"
      >
        <div
          className={cn(
            "flex max-w-full items-center bg-transparent",
            resolvedIconOnly
              ? "w-fit flex-nowrap gap-[2px] overflow-visible"
              : "w-full flex-wrap gap-1 overflow-visible",
          )}
        >
          <BadgesRow
            list={list}
            compact={resolvedCompact}
            iconOnly={resolvedIconOnly}
            titleMaxChars={DEFAULT_TITLE_MAX_CHARS}
            overflow={overflow}
            showOverflowCounter={showOverflowCounter}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
